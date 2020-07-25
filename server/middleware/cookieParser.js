const parseCookies = (req, res, next) => {
  // declare an empty cookie object
  // get cookie string from request
  // split the string by ";" to an cookieArr
  // loop the cookieArr
    // split the string by "=" to an propertyArr
    // assign the first value of propertyArr to key
    // assign the second value of propertyArr to value
    // add the key and value pair to the cookie object
  // update the cookie string in request to the cookie object
};

module.exports = parseCookies;