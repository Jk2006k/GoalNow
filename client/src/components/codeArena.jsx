const runCode = async () => {
  const res = await fetch("http://localhost:5000/api/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code: code,
      language_id: 71,
      input: ""
    })
  })

  const data = await res.json()
  console.log(data)
}