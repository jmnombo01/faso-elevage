/**
 * Faso Élevage - WhatsApp OTP Sender
 * Phase 1 MVP: Support Meta Cloud API + CallMeBot + Mock fallback
 * 
 * Pour activer WhatsApp en prod:
 * 1. Meta Cloud API (recommandé): 
 *    WHATSAPP_PROVIDER=meta
 *    WHATSAPP_TOKEN=EAAxxxxxxxx (Meta Graph API token)
 *    WHATSAPP_PHONE_ID=123456789 (Phone number ID from Meta Business)
 * 
 * 2. CallMeBot (gratuit, 20 msg/jour, pour tests):
 *    WHATSAPP_PROVIDER=callmebot
 *    CALLMEBOT_APIKEY=xxxxxx (user doit activer sur https://www.callmebot.com)
 * 
 * 3. Mock (défaut Phase 1): log + retourne code dans API
 */

const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED !== 'false';
const PROVIDER = process.env.WHATSAPP_PROVIDER || 'mock';

export const sendWhatsAppOtp = async (phone: string, otp: string): Promise<{ success: boolean; provider: string; error?: string }> => {
  if (!WHATSAPP_ENABLED) {
    console.log(`[WhatsApp Mock] OTP ${otp} pour ${phone} (WHATSAPP_ENABLED=false)`);
    return { success: true, provider: 'mock-disabled' };
  }

  const normalizedPhone = phone.replace(/\D/g, ''); // garde 22670000000
  const message = `🔐 Faso Élevage - Votre code OTP est: *${otp}* (valable 5 min). Ne partagez ce code avec personne. 🇧🇫`;

  // Provider Meta Cloud API (recommandé prod)
  if (PROVIDER === 'meta') {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId) {
      console.warn('[WhatsApp Meta] Token ou Phone ID manquant, fallback mock');
      return { success: true, provider: 'mock-no-creds' };
    }
    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'text',
          text: { body: message },
        }),
      });
      const data = await res.json() as any;
      if (!res.ok) {
        console.error('[WhatsApp Meta] Erreur:', data);
        return { success: false, provider: 'meta', error: JSON.stringify(data) };
      }
      console.log(`[WhatsApp Meta] OTP envoyé à ${phone}: ${otp}`);
      return { success: true, provider: 'meta' };
    } catch (e: any) {
      console.error('[WhatsApp Meta] Exception:', e.message);
      return { success: false, provider: 'meta', error: e.message };
    }
  }

  // Provider CallMeBot (gratuit pour tests)
  if (PROVIDER === 'callmebot') {
    const apikey = process.env.CALLMEBOT_APIKEY;
    if (!apikey) {
      console.warn('[CallMeBot] APIKEY manquant');
      return { success: true, provider: 'mock-no-apikey' };
    }
    try {
      // CallMeBot format: https://api.callmebot.com/whatsapp.php?phone=NUMBER&text=MESSAGE&apikey=KEY
      const url = `https://api.callmebot.com/whatsapp.php?phone=${normalizedPhone}&text=${encodeURIComponent(message)}&apikey=${apikey}`;
      const res = await fetch(url);
      const text = await res.text();
      console.log(`[CallMeBot] Réponse: ${text}`);
      return { success: true, provider: 'callmebot' };
    } catch (e: any) {
      console.error('[CallMeBot] Erreur:', e.message);
      return { success: false, provider: 'callmebot', error: e.message };
    }
  }

  // Mock par défaut Phase 1
  console.log(`\n=== [WhatsApp Mock] OTP pour ${phone}: ${otp} ===`);
  console.log(`Message: ${message}`);
  console.log(`Pour activer vrai WhatsApp: set WHATSAPP_PROVIDER=meta + WHATSAPP_TOKEN + WHATSAPP_PHONE_ID\n`);
  return { success: true, provider: 'mock' };
};

export const getWhatsAppLink = (phone: string, otp: string): string => {
  // Lien pour que l'utilisateur ouvre WhatsApp avec le code pré-rempli (utile si envoi auto échoue)
  const text = encodeURIComponent(`Bonjour, mon code Faso Élevage est ${otp}`);
  // On renvoie un lien wa.me vers le numéro de l'utilisateur lui-même avec le code
  // Ou vers support: change SUPPORT_PHONE
  const supportPhone = process.env.WHATSAPP_SUPPORT_PHONE || '22670000000';
  return `https://wa.me/${supportPhone}?text=${text}`;
};
