

export function debug(isDebugMode, msg) {
  if(isDebugMode)
    console.log(msg)
}

export function removeExtraSpaces(myString) {
  return myString.replace(/\s+/g, ' ').trim();
}