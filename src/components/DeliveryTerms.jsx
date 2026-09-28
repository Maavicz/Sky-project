export const DELIVERY_TERMS_VERSION = "1.0";

const terms = [
  {
    title: "Accurate Booking Information",
    paragraphs: ["The customer is responsible for providing complete and accurate information when completing the booking, including sender and receiver names and contact details, pickup and delivery locations, a correct description and quantity of the items, approximate weight and dimensions where applicable, and any special handling requirements.", "Incorrect, incomplete, or misleading information may result in delays, additional charges, return of the shipment, or refusal to accept the shipment."],
  },
  {
    title: "Proper Packaging",
    paragraphs: ["Customers are responsible for ensuring that items are properly and securely packaged before handover. Packaging must suit the nature of the item and withstand normal handling and transportation.", "Skybridge may decline an inadequately packaged item or require it to be repackaged before transportation."],
  },
  {
    title: "Prohibited and Restricted Items",
    paragraphs: ["Customers must not submit, conceal, or attempt to transport any item prohibited or restricted by applicable Nigerian law, aviation, airport, customs, or carrier rules. This includes explosives, firearms and ammunition, illegal drugs or narcotics, hazardous or dangerous substances, flammable materials, prohibited chemicals, counterfeit or stolen goods, and other unlawful or restricted articles.", "Customers must declare items requiring special handling, documentation, permits, or regulatory approval. Skybridge may inspect, reject, hold, or report a shipment where there is reasonable concern about its contents or legality."],
  },
  {
    title: "Honest Declaration of Contents",
    paragraphs: ["The customer must accurately declare the contents and value of every shipment. Misdeclaration, concealment, false documentation, or deliberate omission of an item's contents is strictly prohibited.", "The customer may be responsible for resulting loss, penalties, delay, seizure, damage, regulatory action, or additional costs arising from inaccurate declarations."],
  },
  {
    title: "Inspection and Security",
    paragraphs: ["For safety, security, regulatory, and operational purposes, shipments may be inspected or verified by Skybridge, relevant authorities, carriers, airport security, customs, or other authorized parties.", "Skybridge may refuse or suspend a shipment where its contents, documentation, packaging, or circumstances do not meet applicable requirements."],
  },
  {
    title: "Delivery Time",
    paragraphs: ["Any estimated delivery time provided by Skybridge is an estimate, not an unconditional guarantee. Weather, flight schedules, airport operations, traffic, security checks, customs, documentation issues, carrier schedules, operational conditions, force majeure, and other circumstances beyond Skybridge's reasonable control may affect delivery.", "Customers will be notified where significant operational issues affect delivery."],
  },
  {
    title: "Charges and Additional Costs",
    paragraphs: ["Delivery charges depend on factors including shipment type, weight, dimensions, destination, handling requirements, urgency, and applicable transportation or regulatory charges.", "Additional charges may apply for booking changes, special handling, storage, redelivery, address changes, customs-related costs, or other customer-requested services. Where applicable, charges will be communicated before the additional service is provided."],
  },
  {
    title: "Damage, Loss and Responsibility",
    paragraphs: ["Skybridge will take reasonable care in handling shipments throughout its operational process. Customers should properly package fragile, sensitive, valuable, or delicate items and communicate special handling requirements before handover.", "Responsibility for loss, damage, delay, or other claims may be subject to applicable service and carrier conditions, declared shipment information, applicable law, and agreed limitations of liability. Customers are encouraged to accurately declare valuable or sensitive items and retain proof of ownership or value where appropriate."],
  },
  {
    title: "Perishable, Fragile and Sensitive Items",
    paragraphs: ["Perishable, fragile, temperature-sensitive, high-value, or otherwise sensitive items may require prior approval and special handling arrangements. Skybridge may decline items where the required handling conditions cannot reasonably be provided.", "The customer is responsible for accurately disclosing an item's sensitivity and handling requirements."],
  },
  {
    title: "Receiver and Delivery Confirmation",
    paragraphs: ["The customer is responsible for providing correct receiver information. Delivery may be confirmed through recipient confirmation, signature, verification details, or other available delivery records.", "If the receiver cannot be reached or delivery cannot be completed due to incorrect information, absence, refusal, or circumstances attributable to the customer or receiver, additional delivery or storage arrangements may apply."],
  },
  {
    title: "Shipment Tracking",
    paragraphs: ["Where tracking is available, Skybridge may provide shipment updates through its designated tracking or communication channels. Tracking information helps customers monitor shipment progress and may be subject to operational or system delays."],
  },
  {
    title: "Customs, Airport and Regulatory Requirements",
    paragraphs: ["For shipments requiring customs clearance, permits, identification, declarations, or other regulatory documentation, the customer is responsible for providing required and accurate information and documents.", "Skybridge may assist with logistics coordination where available, but regulatory approval remains subject to the relevant authorities."],
  },
  {
    title: "Customer Communication",
    paragraphs: ["By submitting a booking, the customer authorizes Skybridge to contact them about booking confirmation, pickup arrangements, payment or additional charges, shipment updates, delivery coordination, documentation or verification, and issues affecting the shipment.", "Communication may be through phone calls, WhatsApp, SMS, email, or other contact details supplied in the booking."],
  },
  {
    title: "Cancellation, Changes and Redelivery",
    paragraphs: ["Changes or cancellations should be communicated to Skybridge as early as possible. Charges may apply where transportation, pickup, handling, storage, or other operational activities have already commenced.", "Additional charges may also apply for unsuccessful delivery attempts, address changes, or requested redelivery."],
  },
  {
    title: "Customer Responsibility",
    paragraphs: ["The customer confirms that they have the legal right to send the goods; the shipment contains no prohibited or unlawfully obtained items; booking information is accurate; the shipment is properly packaged and ready for transportation; and required documentation will be provided when requested.", "The customer accepts responsibility for consequences arising from false declarations, prohibited contents, inadequate packaging, or inaccurate information they supply."],
  },
  {
    title: "Right to Refuse a Shipment",
    paragraphs: ["Skybridge reserves the right to refuse, suspend, return, or discontinue transportation where a shipment presents a safety, security, legal, regulatory, documentation, packaging, operational, or reputational concern.", "Where appropriate, the customer will be informed of the reason and any available next steps."],
  },
  {
    title: "Privacy and Customer Information",
    paragraphs: ["Information submitted through the booking form will be used to process, coordinate, track, communicate about, and complete the delivery, and for related operational and administrative purposes, subject to applicable data-protection requirements.", "Customers should provide only information necessary for the booking and must not submit passwords, payment-card PINs, or other unnecessary confidential credentials through the form."],
  },
  {
    title: "Acceptance of Terms",
    paragraphs: ["By checking the box and submitting the booking form, the customer confirms: I have read, understood, and agree to the Skybridge Nexus Logistics LTD Delivery Booking Terms & Conditions. I confirm that the information provided is accurate, my shipment complies with applicable laws and transportation requirements, and I accept responsibility for proper packaging, declaration, documentation, and any applicable charges associated with my booking."],
  },
];

export default function DeliveryTerms({ onReturn }) {
  return (
    <article className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Effective for all delivery bookings</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Delivery Booking Terms &amp; Conditions</h1>
          <p className="mt-3 text-slate-600">Skybridge Nexus Logistics LTD</p>
        </div>
        {onReturn && (
          <button type="button" onClick={onReturn} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
            Return to booking
          </button>
        )}
      </div>
      <p className="mt-6 leading-7 text-slate-700">
        By submitting this booking form, the customer (&quot;Sender&quot; or &quot;Customer&quot;) confirms that they have read, understood, and agreed to these terms governing the handling, transportation, tracking, and delivery of their shipment by Skybridge (&quot;Skybridge&quot;).
      </p>
      <ol className="mt-7 divide-y divide-slate-200">
        {terms.map((term, index) => (
          <li key={term.title} className="py-6 first:pt-0 last:pb-0">
            <h2 className="text-lg font-semibold text-slate-900">{index + 1}. {term.title}</h2>
            {term.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-7 text-slate-700">{paragraph}</p>
            ))}
          </li>
        ))}
      </ol>
      {onReturn && (
        <div className="mt-8 border-t border-slate-200 pt-6">
          <button type="button" onClick={onReturn} className="min-h-11 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
            Return to booking
          </button>
        </div>
      )}
    </article>
  );
}