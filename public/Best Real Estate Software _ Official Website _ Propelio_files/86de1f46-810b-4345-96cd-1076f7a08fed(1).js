(function() {
var el = document.createElement('script');
el.src = 'https://app.ablecdp.com/ue.js';
el.async = 'true';
window.uipeParams = {};el.addEventListener('load', function() {
uipe('init', '86de1f46-810b-4345-96cd-1076f7a08fed');
uipe('track', 'PageView');
function isCalendlyEvent(e) {
  return e.origin === "https://calendly.com" && e.data.event && e.data.event.indexOf("calendly.") === 0;
};

function extractUUIDFromCalendlyURL(inputString) {
  const regex = /https:\/\/api\.calendly\.com\/scheduled_events\/([a-z0-9-]+)\/invitees\/([a-z0-9-]+)/i;
  const match = inputString.match(regex);
  
  if (match && match.length >= 3) {
    const firstUUID = match[1];
    const secondUUID = match[2];
    
    return `${firstUUID}/invitees/${secondUUID}`;
  } else {
    return null; // No match found
  }
}

window.addEventListener("message", function(e) {
  if(isCalendlyEvent(e)) {
    const uri = e.data.payload.invitee?.uri;
    if (!uri)
      return;
    const invitee = extractUUIDFromCalendlyURL(uri);
    window.uipe('track', 'CalendlyForm', { keys: { client_id: `calendly:${invitee.split('/').pop()}` } });
    navigator.sendBeacon('https://svqqt9ohg7.execute-api.eu-west-2.amazonaws.com/webhook/' + window.uipeFunnel,
      JSON.stringify({ invitee }));
  }
});

function setDemoListener() {
  var fr = document.querySelector(".intercom-messenger-frame");
  if (fr) {
    var submitBtn = fr.children[0].contentDocument.body.querySelector('.intercom-messenger-card-component button[aria-label="Submit"]');
    console.log(submitBtn)
    if (submitBtn && window.lastDemoButton !== submitBtn) {
      submitBtn.addEventListener('click', (function(e) {
        window.uipe('track', 'Lead', { keys: { email: e.currentTarget.parentElement.querySelector('input').value } })
      }));
      window.lastDemoButton = submitBtn;
    }
  }
  setTimeout(setDemoListener, 3000);
}
function setIntercomEmailTracking() {
  if (typeof Intercom !== 'undefined') {
    Intercom("onUserEmailSupplied", (function() {
        //console.log("onUserEmailSupplied"), console.log("frame", document.querySelector(".intercom-messenger-frame"));
        var t = document.querySelector(".intercom-messenger-frame").children[0];
        //console.log("intercomIFrame ", t);
        var emailInput = t.contentDocument.body.querySelector('input[type="email"]');
        if (emailInput) {
            var email = emailInput.value;
            window.uipe('track', 'Lead', { keys: { email: email } });
        }
    }));
    setDemoListener();
  } else {
    setTimeout(setIntercomEmailTracking, 5000);
  }
}
setIntercomEmailTracking();

function uipeWooCheckout() {
if (window.jQuery) {
      function uipeInitiateCheckout(e) {
        var f = e.target;
        if (f.tagName !== 'FORM') {
          f = f.closest('form');
        }
        var leadParams = {
          lead: {
            firstName: f.elements['billing_first_name'].value,
            lastName: f.elements['billing_last_name'].value,
          },
          keys: {
            email: f.elements['billing_email'].value,
          },
        };
        if (f.elements['billing_phone']) {
          leadParams.keys.phone = f.elements['billing_phone'].value;
        }
        uipe('track', 'InitiateCheckout', leadParams);
      }

 window.jQuery('form.woocommerce-checkout').submit(uipeInitiateCheckout);
 window.jQuery('.payment_method_paypal_smart_checkout label').click(uipeInitiateCheckout);
 window.jQuery( document ).ajaxComplete(function( event, xhr, settings ) {
   if (settings.url.includes('update_order_review')) {
     window.jQuery('.payment_method_paypal_smart_checkout label').click(uipeInitiateCheckout);
   }
 });
}
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", uipeWooCheckout);
} else {
  uipeWooCheckout();
}

document.addEventListener('om.Optin.init.submit', function(event) {
  const email = event.detail.Optin.data.fields.email;
  uipe('track', 'Lead', {
    keys: {  email },
    custom_data: event.detail.Optin.data.tags,
  })
} );


});
document.head.appendChild(el);
})();