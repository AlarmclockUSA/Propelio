jQuery('document').ready(function(){jQuery('.elementor-widget-jet-switcher[data-id="d361a03"] .jet-switcher__control-handler').addClass('monthly-selected');jQuery('.elementor-4976 .elementor-element.elementor-element-dc64b33 .elementor-button').addClass('monthly');jQuery('.elementor-4976 .elementor-element.elementor-element-13e2a8e .elementor-button').addClass('monthly');jQuery('.elementor-4976 .elementor-element.elementor-element-24099fd .elementor-button').addClass('monthly');jQuery('.elementor-widget-jet-switcher[data-id="d361a03"] .jet-switcher__control-handler.monthly-selected').parent().click(function(){jQuery('.elementor-widget-jet-switcher[data-id="d361a03"] .jet-switcher__control-handler').toggleClass('monthly-selected yearly-selected');jQuery('div[data-id="dc64b33"] a.elementor-button').toggleClass('monthly yearly');jQuery('div[data-id="13e2a8e"] a.elementor-button').toggleClass('monthly yearly');jQuery('div[data-id="24099fd"] a.elementor-button').toggleClass('monthly yearly')});jQuery('.monthly-selected').parent().click(function(){console.log('switcher changed to yearly');jQuery('div[data-id="dc64b33"] a.yearly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPO8LqWXedw9D5jVshVppr');jQuery('div[data-id="13e2a8e"] a.yearly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPTYLqWXedw9D5ylGLL8mF');jQuery('div[data-id="24099fd"] a.yearly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPXaLqWXedw9D5CB5A1grb');jQuery('.yearly-selected').parent().click(function(){console.log('switcher changed to monthly');jQuery('div[data-id="dc64b33"] a.monthly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPM7LqWXedw9D5JFlBobZ8');jQuery('div[data-id="13e2a8e"] a.monthly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPRcLqWXedw9D5G16QoAmG');jQuery('div[data-id="24099fd"] a.monthly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPW3LqWXedw9D5vJ5SB5bz')})});jQuery('.yearly-selected').parent().click(function(){console.log('switcher changed to monthly');jQuery('div[data-id="dc64b33"] a.monthly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPM7LqWXedw9D5JFlBobZ8');jQuery('div[data-id="13e2a8e"] a.monthly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPRcLqWXedw9D5G16QoAmG');jQuery('div[data-id="24099fd"] a.monthly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPW3LqWXedw9D5vJ5SB5bz');jQuery('.monthly-selected').parent().click(function(){console.log('switcher changed to yearly');jQuery('div[data-id="dc64b33"] a.yearly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPO8LqWXedw9D5jVshVppr');jQuery('div[data-id="13e2a8e"] a.yearly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPTYLqWXedw9D5ylGLL8mF');jQuery('div[data-id="24099fd"] a.yearly').attr('href','https://genesis.propelio.com/register?planId=price_1OpPXaLqWXedw9D5CB5A1grb')})})})