/* Syntix Premium — Stripe webhook (OPTIONAL, requires the Firebase Blaze plan).
   Grants / extends premium/{uid} = { until, plan, subscriptionId } after a successful payment.
   Supports SUBSCRIPTION prices (monthly / yearly Payment Links). Not load-tested: try it in Stripe test mode first. */
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();
const STRIPE_KEY = defineSecret('STRIPE_SECRET_KEY');
const WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

// Stripe moved some fields in newer API versions, so read both locations
const periodEnd = sub => sub.current_period_end || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end) || 0;
const invoiceSub = inv => inv.subscription || (inv.parent && inv.parent.subscription_details && inv.parent.subscription_details.subscription) || null;
const planOf = sub => {
  const i = sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.recurring;
  return i ? i.interval : 'unknown';
};

exports.stripeWebhook = onRequest({ secrets: [STRIPE_KEY, WEBHOOK_SECRET] }, async (req, res) => {
  const stripe = new Stripe(STRIPE_KEY.value());
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], WEBHOOK_SECRET.value());
  } catch (err) {
    console.error('Bad Stripe signature', err.message);
    res.status(400).send('Invalid signature');
    return;
  }
  const db = admin.firestore();
  const Timestamp = admin.firestore.Timestamp;

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const uid = s.client_reference_id;                    // set by the site: ?client_reference_id=<uid>
      if (uid && s.mode === 'subscription' && s.subscription && s.payment_status !== 'unpaid') {
        const sub = await stripe.subscriptions.retrieve(s.subscription);
        await db.collection('premium').doc(uid).set({
          until: Timestamp.fromMillis(periodEnd(sub) * 1000), plan: planOf(sub), subscriptionId: sub.id, source: 'stripe',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } else if (event.type === 'invoice.paid') {
      const subId = invoiceSub(event.data.object);          // renewals
      if (subId) {
        const snap = await db.collection('premium').where('subscriptionId', '==', subId).limit(1).get();
        if (!snap.empty) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await snap.docs[0].ref.set({ until: Timestamp.fromMillis(periodEnd(sub) * 1000), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
        }
      }
    }
    // customer.subscription.deleted: nothing to do — access simply ends at `until`
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler failed', err);
    res.status(500).send('Handler error');
  }
});
