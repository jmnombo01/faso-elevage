/**
 * CinetPay Integration - Faso Élevage Phase 2
 * Docs: https://docs.cinetpay.com/
 * Support BF: Orange Money, Moov Money, Telecel, Wave
 */

const CINETPAY_APIKEY = process.env.CINETPAY_APIKEY;
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_SECRET = process.env.CINETPAY_SECRET; // for webhook verification
const CINETPAY_BASE = process.env.CINETPAY_BASE || 'https://api.cinetpay.com/v1';

interface CinetPayInit {
  amount: number;
  currency: string;
  transaction_id: string;
  description: string;
  customer_name?: string;
  customer_surname?: string;
  customer_email?: string;
  customer_phone_number?: string;
  customer_address?: string;
  customer_city?: string;
  customer_country?: string;
  customer_state?: string;
  customer_zip_code?: string;
  return_url?: string;
  notify_url?: string;
  metadata?: string;
  alternative_currency?: string;
  invoice_data?: any;
}

export const initCinetPayPayment = async (params: {
  amountFcfa: number;
  transactionId: string;
  description: string;
  customerName: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl: string;
}): Promise<{ payment_url: string; transaction_id: string; token?: string } | null> => {
  // Mock mode si pas de creds CinetPay (Phase 1/Dev)
  if (!CINETPAY_APIKEY || !CINETPAY_SITE_ID) {
    console.log(`[CinetPay Mock] Paiement ${params.amountFcfa}F pour ${params.transactionId} - ${params.description}`);
    console.log(`[CinetPay Mock] Retourne URL mock, à remplacer par vraie URL CinetPay en prod`);
    return {
      payment_url: `${params.returnUrl}?transaction_id=${params.transactionId}&mock_success=1`,
      transaction_id: params.transactionId,
      token: 'mock_token',
    };
  }

  try {
    const payload: CinetPayInit = {
      amount: params.amountFcfa,
      currency: 'XOF',
      transaction_id: params.transactionId,
      description: params.description,
      customer_name: params.customerName,
      customer_phone_number: params.customerPhone.replace('+', ''),
      return_url: params.returnUrl,
      notify_url: params.notifyUrl,
      metadata: JSON.stringify({ faso_elevage: true }),
    };

    const res = await fetch(`${CINETPAY_BASE}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: CINETPAY_APIKEY,
        site_id: CINETPAY_SITE_ID,
        ...payload,
      }),
    });

    const data = await res.json() as any;
    console.log('[CinetPay] Init response:', JSON.stringify(data).slice(0,500));

    if (data.code === '201' || data.data?.payment_url) {
      return {
        payment_url: data.data.payment_url,
        transaction_id: params.transactionId,
        token: data.data.payment_token,
      };
    }

    console.error('[CinetPay] Erreur init:', data);
    return null;
  } catch (e: any) {
    console.error('[CinetPay] Exception init:', e.message);
    return null;
  }
};

export const checkCinetPayPayment = async (transactionId: string): Promise<{ status: 'SUCCESS' | 'PENDING' | 'FAILED'; data?: any }> => {
  if (!CINETPAY_APIKEY || !CINETPAY_SITE_ID) {
    // Mock: considère succès après 2 sec pour tests
    console.log(`[CinetPay Mock] Check ${transactionId} -> SUCCESS (mock)`);
    return { status: 'SUCCESS', data: { mock: true } };
  }

  try {
    const res = await fetch(`${CINETPAY_BASE}/payment/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: CINETPAY_APIKEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transactionId,
      }),
    });
    const data = await res.json() as any;
    console.log('[CinetPay] Check:', JSON.stringify(data).slice(0,500));

    // CinetPay retourne status: SUCCESS, PENDING, etc.
    if (data.data?.status === 'ACCEPTED' || data.code === '00') {
      return { status: 'SUCCESS', data };
    }
    if (data.data?.status === 'REFUSED' || data.code === '600') {
      return { status: 'FAILED', data };
    }
    return { status: 'PENDING', data };
  } catch (e: any) {
    console.error('[CinetPay] Check error:', e.message);
    return { status: 'PENDING' };
  }
};

// Tarifs Boost Phase 2 - Low pricing Burkina
export const BOOST_PRICING: Record<number, { amount: number; label: string }> = {
  3: { amount: 500, label: 'Boost 3 jours - 500 FCFA' },
  7: { amount: 1000, label: 'Boost 7 jours - 1000 FCFA (populaire)' },
  30: { amount: 2000, label: 'Boost 30 jours - 2000 FCFA (meilleur)' },
};

export const BADGE_PRICING = {
  30: { amount: 3000, label: 'Badge Vérifié 30 jours - 3000 FCFA' },
  90: { amount: 7500, label: 'Badge Vérifié 90 jours - 7500 FCFA' },
  365: { amount: 20000, label: 'Badge Vérifié 1 an - 20000 FCFA' },
};
