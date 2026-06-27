const key = '3918af21893e9e8354db7d1024b99ff9b41ce91a0275624';

async function testNimbus() {
  const payload = {
    origin: "110001",
    destination: "400001",
    payment_type: "prepaid",
    weight: 1
  };
  
  // Try endpoint 1 - Bearer token was invalid, try custom header
  try {
    const res = await fetch("https://api.nimbuspost.com/v1/courier/serviceability", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${key}`
      },
      body: JSON.stringify(payload)
    });
    console.log("Authorization: Token -> status:", res.status, await res.text());
  } catch(e) {}

  // Try in body
  try {
    const res = await fetch("https://api.nimbuspost.com/v1/courier/serviceability", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, token: key })
    });
    console.log("Body: token -> status:", res.status, await res.text());
  } catch(e) {}
}

testNimbus();
