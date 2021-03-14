const stripe = require('stripe')('sk_test_51IGMwfIz2L1uV3tKcnAEgBpqJ5ko6XfnwVVPqCZNkb9yzpZmolfS8iZFZtBahM8rT8jr8JUqrLm8DFiI9fv5f3O300YRok7Rkg');
const express = require('express');
const app = express();
// const bodyParser = require('body-parser')

app.use(express.static('.'));

app.use(express.json())

const YOUR_DOMAIN = 'http://localhost:3000/checkout';

app.post('/create-checkout-session', async (req, res) => {
  console.log('body: ',req.body)
  console.log('res body: ', res.body)

  const parseCart = () => {
    //check items vs strapi
    //put items in line_items format
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Stubborn Attachments',
            images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  res.json({ id: session.id });
});

app.listen(4242, () => console.log('Running on port 4242'));

module.exports = app