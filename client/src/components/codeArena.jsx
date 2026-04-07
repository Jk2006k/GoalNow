const runCode = async () => {
  const res = await fetch("https://goalnow.onrender.com/api/run", {
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