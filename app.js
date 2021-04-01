require('dotenv').config()

const stripe = require('stripe')('sk_test_51IGMwfIz2L1uV3tKcnAEgBpqJ5ko6XfnwVVPqCZNkb9yzpZmolfS8iZFZtBahM8rT8jr8JUqrLm8DFiI9fv5f3O300YRok7Rkg');
const express = require('express');
const fetch = require('node-fetch');

const app = express();
// const bodyParser = require('body-parser')

app.use(express.static('.'));

app.use(express.json())

const YOUR_DOMAIN = 'http://localhost:3000/checkout';

class LineItem {
  constructor(name, images, price, quantity){
    this.quantity = quantity
    this.price_data = {
      currency: 'gbp',
      product_data:{
        name,
        images
      },
      unit_amount: price
    }
  }
}

const checkPricesAndCalc = (item, serverArr) => {
  const lookupItemId = item.product.id
  const serverProduct = serverArr.find(arrItem=>arrItem.id === lookupItemId)

  const {
    title,
    price,
    sale_price,
    image,
  } = serverProduct

  // console.log(image[0].url)

  const {quantity} = item
  const imageUrl = process.env.STRAPI_URL + image[0].url
  const checkedSalePrice = (sale_price ? sale_price : price)*100

  const newLineItem = new LineItem(
    title,
    [imageUrl],
    checkedSalePrice,
    quantity
  )

  //un-object the line item
  return JSON.parse(JSON.stringify(newLineItem))
}

app.post('/create-checkout-session', async (req, res) => {


  await fetch(`${process.env.STRAPI_URL}/products`)
    .then(res=>res.json())
    .then((serverCart)=> 
      req.body.cart.map((item) => checkPricesAndCalc(item, serverCart))
    ).then(async (lineItemsArray) =>{
      console.log(lineItemsArray)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItemsArray,
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}?success=true`,
        cancel_url: `${YOUR_DOMAIN}?canceled=true`,
      });
      console.log({res})
      res.json({ id: session.id });
    })

  const testItem = new LineItem('test item','test image', 2000, 2)

  // console.log(testItem)

  

  const parseCartToLineItems = (cart) => {
    // cart.map(item => {
    //   // const 
    // })
  }

  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   line_items: parseCartToLineItems(req.cart),
  //   mode: 'payment',
  //   success_url: `${YOUR_DOMAIN}?success=true`,
  //   cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  // });

  // res.json({ id: session.id });
});

app.listen(4242, () => console.log('Running on port 4242'));

module.exports = app