import type {
  AttendeeOrderBuyer,
  DemoPaymentOutcome,
  PrimaryCheckoutSelection,
} from "../../orders";
export type PrimaryCheckoutSubmission = {
  selection: PrimaryCheckoutSelection;
  buyer: AttendeeOrderBuyer;
  outcome: DemoPaymentOutcome;
  transferContent: string;
};
