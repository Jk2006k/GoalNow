import React from 'react'
import DSACodeEditor from '../components/DSACodeEditor'

export default function DSAInterview() {
  // Scroll to top on component mount
  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return <DSACodeEditor />
}