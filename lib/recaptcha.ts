import axios from "axios"

export async function verifyRecaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    console.log(`Verifying reCAPTCHA token with Google API...`)
    console.log(`Token length: ${token.length}`)
    console.log(`Secret key length: ${secretKey ? secretKey.length : 0}`)

    if (!token || !secretKey) {
      console.error("Missing token or secret key for reCAPTCHA verification")
      return false
    }

    const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
      params: {
        secret: secretKey,
        response: token,
      },
    })

    console.log("Google reCAPTCHA API response:", response.data)

    if (!response.data.success) {
      console.error("reCAPTCHA verification failed:", response.data["error-codes"])
    }

    return response.data.success === true
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return false
  }
}

export async function verifyRecaptchaV3(token: string, secretKey: string, threshold = 0.5): Promise<boolean> {
  try {
    console.log(`Verifying reCAPTCHA v3 token with Google API...`)
    console.log(`Token length: ${token.length}`)
    console.log(`Secret key length: ${secretKey ? secretKey.length : 0}`)
    console.log(`Threshold: ${threshold}`)

    if (!token || !secretKey) {
      console.error("Missing token or secret key for reCAPTCHA v3 verification")
      return false
    }

    const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
      params: {
        secret: secretKey,
        response: token,
      },
    })

    console.log("Google reCAPTCHA v3 API response:", response.data)

    // For v3, we need to check both success and score
    const isValid = response.data.success === true && response.data.score >= threshold

    if (!isValid) {
      if (!response.data.success) {
        console.error("reCAPTCHA v3 verification failed:", response.data["error-codes"])
      } else if (response.data.score < threshold) {
        console.error(`reCAPTCHA v3 score too low: ${response.data.score} (threshold: ${threshold})`)
      }
    }

    return isValid
  } catch (error) {
    console.error("reCAPTCHA v3 verification error:", error)
    return false
  }
}
