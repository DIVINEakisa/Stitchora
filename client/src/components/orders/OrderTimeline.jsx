import { STATUS_STEPS, getStatusIndex } from '../../utils/orderStatus';

export default function OrderTimeline({ status }) {
  const currentIdx = getStatusIndex(status);

  if (status === 'rejected') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        This order was rejected by the designer.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-2">
      <ol className="flex min-w-[600px] items-center justify-between">
        {STATUS_STEPS.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          return (
            <li key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {idx > 0 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors duration-300 ${
                      idx <= currentIdx ? 'bg-primary' : 'bg-primary/15'
                    }`}
                  />
                )}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    done
                      ? 'bg-primary text-white shadow-soft'
                      : 'border-2 border-primary/20 bg-white text-charcoal/40'
                  } ${active ? 'ring-4 ring-accent/30' : ''}`}
                >
                  {idx + 1}
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 transition-colors duration-300 ${
                      idx < currentIdx ? 'bg-primary' : 'bg-primary/15'
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-center text-xs transition-colors duration-300 ${
                  done ? 'font-medium text-primary' : 'text-charcoal/40'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
