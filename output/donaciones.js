const stripe = Stripe('pk_test_51UEw8wCNOpaMFlfCDyRbkzqTLjgg93t5GI14zJokS57xxdRfAOoLvlGzX6afI1k7NMtMmsAWISQEqGs9nVcNzQp900m3hw8J6Y');

const appearance = { /* appearance */ };
const options = {
	  layout: {
		      type: 'tabs',
		      defaultCollapsed: false,
		    }
};
const elements = stripe.elements({ clientSecret, appearance });
const paymentElement = elements.create('payment', options);
paymentElement.mount('#payment-element');
