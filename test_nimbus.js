const key = '3918af21893e9e8354db7d1024b99ff9b41ce91a0275624';

async function testNimbus() {
  const payload = {
    origin: "110001",
    destination: "400001",
    payment_type: "prepaid",
    weight: 1
  };
  
  // Try endpoint 1
  try {
    const res = await fetch("https://api.nimbuspost.com/v1/courier/serviceability", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(payload)
    });
    console.log("Endpoint 1 status:", res.status);
    console.log("Endpoint 1 data:", await res.text());
  } catch(e) { console.error(e.message); }
}

testNimbus();
