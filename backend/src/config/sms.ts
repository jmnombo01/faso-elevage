/**
 * Faso Élevage - SMS OTP Sender
 * Support: CinetPay (via agrégateur local), Twilio, BulkSMS, Generic HTTP, Mock
 * 
 * Env:
 * SMS_PROVIDER=mock|cinetpay|twilio|bulksms|generic
 * 
 * CinetPay (pour Paiement Phase 2, mais on peut utiliser leur partenaire SMS):
 *   CINETPAY_APIKEY=...
 *   CINETPAY_SITE_ID=...
 *   SMS_API_URL=https://api.smsbf.com/v1/sms (exemple Burkina)
 *   SMS_API_KEY=...
 * 
 * Pour Burkina Faso, fournisseurs locaux recommandés:
 * - SMS BF: https://www.smsbf.com/
 * - mTarget: https://mtarget.fr/
 * - Orange SMS API: https://api.orange.com/sms
 * 
 * Phase 1 MVP: mock par défaut
 */

const SMS_ENABLED = process.env.SMS_ENABLED !== 'false';
const PROVIDER = process.env.SMS_PROVIDER || 'mock';

export const sendSmsOtp = async (phone: string, otp: string): Promise<{ success: boolean; provider: string; error?: string }> => {
  if (!SMS_ENABLED) {
    console.log(`[SMS Mock] OTP ${otp} pour ${phone} (SMS_ENABLED=false)`);
    return { success: true, provider: 'mock-disabled' };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const message = `Faso Elevage: Votre code OTP est ${otp}. Valable 5 min. Ne partagez pas ce code.`;

  // Provider CinetPay - utilisé comme agrégateur, mais en réalité on appelle API SMS locale configurée via SMS_API_URL
  // CinetPay lui-même est pour Mobile Money Phase 2, pas SMS OTP, mais on garde le nom pour cohérence BF
  if (PROVIDER === 'cinetpay') {
    const apiUrl = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY || process.env.CINETPAY_APIKEY;
    if (!apiUrl) {
      console.warn('[SMS CinetPay] SMS_API_URL manquant, fallback mock. Configure SMS_API_URL=https://api.smsbf.com/send');
      return { success: true, provider: 'mock-no-url' };
    }
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }) },
        body: JSON.stringify({
          to: `+${cleanPhone}`,
          from: process.env.SMS_SENDER || 'FasoElevage',
          message,
          otp,
        }),
      });
      const data = await res.text();
      console.log(`[SMS CinetPay] Envoyé à ${phone}: ${otp} - Réponse: ${data.slice(0,200)}`);
      return { success: res.ok, provider: 'cinetpay', error: res.ok ? undefined : data };
    } catch (e: any) {
      console.error('[SMS CinetPay] Erreur:', e.message);
      return { success: false, provider: 'cinetpay', error: e.message };
    }
  }

  // Provider Generic HTTP (pour tout agrégateur SMS BF local)
  if (PROVIDER === 'generic') {
    const apiUrl = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY;
    if (!apiUrl) return { success: true, provider: 'mock-no-generic-url' };
    try {
      // Supporte format ?phone=...&message=... ou JSON selon provider
      const url = apiUrl.includes('{phone}') 
        ? apiUrl.replace('{phone}', cleanPhone).replace('{message}', encodeURIComponent(message)).replace('{otp}', otp)
        : apiUrl;
      
      const res = await fetch(url, {
        method: process.env.SMS_METHOD || 'POST',
        headers: { 'Content-Type': 'application/json', ...(apiKey && { 'x-api-key': apiKey }) },
        body: process.env.SMS_METHOD === 'GET' ? undefined : JSON.stringify({ phone: cleanPhone, message, otp }),
      });
      const txt = await res.text();
      console.log(`[SMS Generic] ${phone} -> ${txt.slice(0,200)}`);
      return { success: res.ok, provider: 'generic' };
    } catch (e: any) {
      return { success: false, provider: 'generic', error: e.message };
    }
  }

  // Provider Twilio
  if (PROVIDER === 'twilio') {
    const sid = process.env.TWILIO_SID;
    const token = process.env.TWILIO_TOKEN;
    const from = process.env.TWILIO_FROM;
    if (!sid || !token || !from) {
      console.warn('[SMS Twilio] Creds manquants');
      return { success: true, provider: 'mock-no-twilio-creds' };
    }
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const params = new URLSearchParams({ From: from, To: `+${cleanPhone}`, Body: message });
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const data = await res.json() as any;
      console.log(`[SMS Twilio] Envoyé à ${phone}:`, data.sid || data);
      return { success: res.ok, provider: 'twilio', error: res.ok ? undefined : JSON.stringify(data) };
    } catch (e: any) {
      return { success: false, provider: 'twilio', error: e.message };
    }
  }

  // Mock par défaut Phase 1
  console.log(`\n=== [SMS Mock - CinetPay Mode] OTP pour ${phone}: ${otp} ===`);
  console.log(`Message: ${message}`);
  console.log(`Pour activer vrai SMS: set SMS_PROVIDER=cinetpay + SMS_API_URL + SMS_API_KEY`);
  console.log(`Pour Phase 2 Paiement Mobile Money: CINETPAY_APIKEY + SITE_ID via https://cinetpay.com\n`);
  return { success: true, provider: 'mock' };
};
