export const edge = true;

const isAddressCompliant = async (address: string) => {
  let identifications;
  console.log("[Is Address Compliant] Checking address", address);
  const apiKey = process.env.CHAINANALYSIS_API_KEY;
  if (!apiKey) {
    console.error(
      "[Is Address Compliant] No API key found, cannot check compliance"
    );
    return false;
  }
  try {
    identifications = await (
      await fetch(`https://public.chainalysis.com/api/v1/address/${address}`, {
        // Okay to expose key for now, since free tier
        headers: {
          "X-API-Key": `${apiKey}`,
          Accept: "application/json",
        },
      })
    ).json();
  } catch (e) {
    console.error("[Is Address Compliant] Error fetching identifications", e);
    return false;
  }

  if (!identifications.identifications) {
    console.error(
      "[Is Address Compliant] Cannot parse returned object",
      identifications
    );
    return false;
  }
  const isCompliant = identifications.identifications.length === 0;
  console.log(
    "[Is Address Compliant] Is compliant?",
    address,
    isCompliant,
    identifications
  );
  // Must not be on any lists
  return identifications.identifications.length === 0;
};

export async function POST(request: Request) {
  const body = await request.json();
  let isCompliant = false;
  if (body.address) {
    try {
      isCompliant = await isAddressCompliant(body.address);
    } catch (e) {
      console.error("[Is Address Compliant] Error fetching identifications", e);
      isCompliant = false;
    }
  }

  return new Response(
    JSON.stringify({
      isCompliant,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }
  );
}
