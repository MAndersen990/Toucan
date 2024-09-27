import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'firebase/app-check'
import { appCheck } from '../../firebase/firebaseConfig'

const FIREBASE_FUNCTION_URL = 'https://analyze-stocks-65l7ntn3wq-uc.a.run.app'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { tickers } = req.query

    if (!tickers || typeof tickers !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing tickers parameter' })
    }

    try {
      let headers: Record<string, string> = {}

      // Only get App Check token if appCheck is initialized
      if (appCheck) {
        const appCheckToken = await getToken(appCheck, /* forceRefresh */ false)
        headers['X-Firebase-AppCheck'] = appCheckToken.token
      }

      const response = await fetch(`${FIREBASE_FUNCTION_URL}?tickers=${tickers}`, { headers })
      
      if (!response.ok) {
        throw new Error('Firebase function returned an error')
      }

      const data = await response.json()
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error calling Firebase function:', error)
      return res.status(500).json({ error: 'An error occurred while processing the request' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}