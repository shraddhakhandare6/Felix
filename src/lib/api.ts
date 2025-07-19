
export async function fetchWalletBalance(userEmail: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('API base URL is not configured');
  }

  const url = `${baseUrl}/api/v1/wallets/balance/type/user/${encodeURIComponent(userEmail)}`;
  console.log('Fetching balance from URL:', url);

  const response = await fetch(url);

  console.log('Balance API response status:', response.status);
  console.log('Balance API response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch wallet balance' }));
    console.error('Balance API error:', errorData);
    throw new Error(errorData.message);
  }

  const data = await response.json();
  console.log('Balance API response data:', data);
  return data.data;
}

export async function fetchUserTransactions(userEmail: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('API base URL is not configured');
  }

  const response = await fetch(`${baseUrl}/api/v1/wallets/transactions/type/user/${encodeURIComponent(userEmail)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch transactions' }));
    throw new Error(errorData.message);
  }

  const data = await response.json();
  return data.data;
}

export async function sendPayment({
  recipient,
  amount,
  memo,
  senderEmail
}: {
  recipient: string;
  amount: string;
  memo?: string;
  senderEmail: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('API base URL is not configured');
  }

  const url = `${baseUrl}/api/v1/wallets/send`;
  const payload = {
    recipient,
    amount,
    memo: memo || '',
    senderEmail
  };

  console.log('Sending payment to URL:', url);
  console.log('Payment payload:', payload);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  console.log('Send payment API response status:', response.status);
  console.log('Send payment API response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to send payment' }));
    console.error('Send payment API error:', errorData);
    throw new Error(errorData.message);
  }

  const data = await response.json();
  console.log('Send payment API response data:', data);
  return data;
}

export async function issueAsset({
  assetCode,
  recipient,
  isEntity,
  amount,
}: {
  assetCode: string;
  recipient: string;
  isEntity: boolean;
  amount: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('API base URL is not configured');
  }

  const response = await fetch(`${baseUrl}/api/v1/wallets/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assetCode,
      recepient: recipient,
      isEntity,
      amount,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to issue asset' }));
    throw new Error(errorData.message);
  }

  return response.json();
} 