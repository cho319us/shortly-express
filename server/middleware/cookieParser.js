const parseCookies = (req, res, next) => {
  // declare an empty cookie object
  var cookieObj = {};
  // get cookie string from request
  // req.get() <= Returns the specified HTTP request header field
  var cookieStr = req.get('Cookie') ? req.get('Cookie') : '';
  if (cookieStr !== '') {
    // split the string by ";" to an cookieArr
    var cookieArr = cookieStr.split(';');
    // loop the cookieArr
    for (var i = 0; i < cookieArr.length; i++) {
      // split the string by "=" to an propertyArr // trim() <= remove space
      var propertyArr = cookieArr[i].trim().split('=');
      // assign the first value of propertyArr to key
      var key = propertyArr[0];
      // assign the second value of propertyArr to value
      var value = propertyArr[1];
      // add the key and value pair to the cookie object
      cookieObj[key] = value;
    }
  }
  // update the cookie string in request to the cookie object
  // req.cookies <= this property is an object that contains cookies sent by the request
  req.cookies = cookieObj;

  next();
};

module.exports = parseCookies;