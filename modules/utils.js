function getDate() {
  // Return the server's current date/time string, including timezone
  return new Date().toString();
}

module.exports = { getDate };