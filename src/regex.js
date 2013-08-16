/**
 * Regex patterns used through abaaso
 *
 * `url` was authored by Diego Perini
 *
 * @class regex
 * @namespace abaaso
 * @public
 */
var regex = {
	after_space             : /\s+.*/,
	android                 : /android/i,
	allow                   : /^allow$/i,
	allow_cors              : /^access-control-allow-methods$/i,
	alphanum                : /^[a-zA-Z0-9]+$/,
	and                     : /^&/,
	asc                     : /\s+asc$/ig,
	auth                    : /\/\/(.*)\@/,
	blackberry              : /blackberry/i,
	"boolean"               : /^(true|false)?$/,
	boolean_number_string   : /boolean|number|string/,
	cdata                   : /\&|<|>|\"|\'|\t|\r|\n|\@|\$/,
	checked_disabled        : /checked|disabled/i,
	chrome                  : /chrome/i,
	complete_loaded         : /^(complete|loaded)$/i,
	csv_quote               : /^\s|\"|\n|,|\s$/,
	del                     : /^del/,
	decimal                 : /^\d+.(\d+)/,
	desc                    : /\s+desc$/i,
	domain                  : /^[\w.-_]+\.[A-Za-z]{2,}$/,
	double_slash            : /\/\//,
	down                    : /down/,
	down_up                 : /down|up/,
	email                   : /^[a-zA-Z0-9.!#$%&'*+\/=?\^_`{|}~\-]+@[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,253}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,253}[a-zA-Z0-9])?)*$/,
	endslash                : /\/$/,
	element_update          : /innerHTML|innerText|textContent|type|src/,
	firefox                 : /firefox/i,
	get_headers             : /^(head|get|options)$/,
	get_remove_set          : /get|remove|set/,
	hash                    : /^\#/,
	hash_bang               : /^\#\!?/,
	header_replace          : /:.*/,
	header_value_replace    : /.*:\s+/,
	http_body               : /200|202|203|206/,
	http_ports              : /80|443/,
	ie                      : /msie|ie/i,
	input_button            : /button|submit|reset/,
	integer                 : /(^-?\d\d*$)/,
	ip                      : /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
	is_xml                  : /^<\?xml.*\?>/,
	ios                     : /ipad|iphone/i,
	json_maybe              : /json|plain|javascript/,
	json_wrap               : /^[\[\{]/,
	jsonp_wrap              : /([a-zA-Z0-9\.]+\()(.*)(\))$/,
	klass                   : /^\./,
	linux                   : /linux|bsd|unix/i,
	no                      : /no/i,
	not_endpoint            : /.*\//,
	notEmpty                : /\w{1,}/,
	number                  : /(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)|number/,
	number_format_1         : /.*\./,
	number_format_2         : /\..*/,
	number_present          : /\d{1,}/,
	number_string           : /number|string/i,
	number_string_object    : /number|object|string/i,
	null_undefined          : /null|undefined/,
	observer_allowed        : /click|error|key|mousedown|mouseup|submit/i,
	observer_globals        : /body|document|window/i,
	object_type             : /\[object Object\]/,
	object_undefined        : /object|undefined/,
	opera                   : /opera/i,
	osx                     : /macintosh/i,
	patch                   : /^patch$/,
	phone                   : /^([0-9\(\)\/\+ \-\.]+)$/,
	playbook                : /playbook/i,
	plural                  : /s$/,
	primitive               : /^(boolean|function|number|string)$/,
	priv                    : /private/,
	put_post                : /^(post|put)$/i,
	radio_checkbox          : /^(radio|checkbox)$/i,
	reflect                 : /function\s+\w*\s*\((.*?)\)/,
	root                    : /^\/[^\/]/,
	route_nget              : /^(head|options)$/i,
	route_methods           : /^(all|delete|get|put|post|head|options)$/i,
	safari                  : /safari/i,
	scheme                  : /.*\/\//,
	select                  : /select/i,
	selector_is             : /^:/,
	selector_many           : /\:|\.|\+|\~|\[/,
	selector_complex        : /\s+|\>|\+|\~|\:|\[/,
	selector_split          : /\s+|\>|\+|\~/,
	sensitivity_types       : /ci|cs|ms/,
	set_del                 : /^(set|del|delete)$/,
	sort_needle             : /^.*:::/,
	sort_value              : /:::.*$/,
	space_hyphen            : /\s|-/,
	string_boolean          : /^(true|false)$/i,
	string_object           : /string|object/i,
	string_true             : /^true$/i,
	svg                     : /svg/,
	top_bottom              : /top|bottom/i,
	true_undefined          : /true|undefined/i,
	url                     : /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i,
	webos                   : /webos/i,
	windows                 : /windows/i,
	word                    : /^\w+$/,
	xml                     : /xml/i
};
