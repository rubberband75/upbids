import sgMail from "@sendgrid/mail"
import { NextApiRequest, NextApiResponse } from "next"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //   const { email, subject, message, name } = req.body
  const msg: sgMail.MailDataRequired = {
    to: "Chandler Childs <rubberband75@gmail.com>",
    from: process.env.EMAIL_FROM,
    subject: "UpBids Test Email",
    text: `*Anakin Voice*: It's working!....I'ts working!`,
  }

  try {
    await sgMail.send(msg)
    res.json({ message: `Email has been sent` })
  } catch (error) {
    res.status(500).json({ error: "Error sending email" })
  }
}
