require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');

async function createProductsAndPrices() {
  try {
    const monthlyProduct = await stripe.products.create({
      name: 'Golf Charity Platform - Monthly',
      description: 'Monthly subscription. Includes 5 rolling scores and 10% charity donation.',
    });

    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 199, // $1.99
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    const yearlyProduct = await stripe.products.create({
      name: 'Golf Charity Platform - Yearly',
      description: 'Yearly subscription. Includes 5 rolling scores and 10% charity donation + 15% discount.',
    });

    const yearlyPrice = await stripe.prices.create({
      product: yearlyProduct.id,
      unit_amount: 999, // $9.99
      currency: 'usd',
      recurring: { interval: 'year' },
    });

    const envPath = path.join(__dirname, '.env');
    fs.appendFileSync(envPath, `\nSTRIPE_PRICE_MONTHLY=${monthlyPrice.id}\nSTRIPE_PRICE_YEARLY=${yearlyPrice.id}\n`);
    console.log("Successfully appended to .env!");
  } catch (error) {
    console.error("Error creating products and prices:", error.message);
  }
}

createProductsAndPrices();
