import type { AttendeeOrderBuyer, DemoPaymentOutcome, PrimaryCheckoutSelection } from '../../orders'
export type PrimaryCheckoutDraft = AttendeeOrderBuyer & { acceptedTerms: boolean }
export type PrimaryCheckoutField = keyof PrimaryCheckoutDraft
export type PrimaryCheckoutErrors = Partial<Record<PrimaryCheckoutField, string>>
export type PrimaryCheckoutSubmission = { selection: PrimaryCheckoutSelection; buyer: AttendeeOrderBuyer; outcome: DemoPaymentOutcome; transferContent: string }
