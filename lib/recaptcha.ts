import axios from "axios"

export async function verifyRecaptcha(token: string, secretKey: string): Promise<boolean> {
  try {

    if (!token || !secretKey) {
      return false
    }

    const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
      params: {
        secret: secretKey,
        response: token,
      },
    })


    if (!response.data.success) {
    }

    return response.data.success === true
  } catch (error) {
    return false
  }
}

export async function verifyRecaptchaV3(token: string, secretKey: string, threshold = 0.5): Promise<boolean> {
  try {

    if (!token || !secretKey) {
      return false
    }

    const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
      params: {
        secret: secretKey,
        response: token,
      },
    })


    // For v3, we need to check both success and score
    const isValid = response.data.success === true && response.data.score >= threshold

    if (!isValid) {
      if (!response.data.success) {
      } else if (response.data.score < threshold) {
      }
    }

    return isValid
  } catch (error) {
    return false
  }
}
