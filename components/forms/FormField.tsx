'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useId, type ReactNode } from 'react';
import { feedbackMessage } from '@/lib/animations/transitions';
import { COPY } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Form field primitives.
 *
 * Accessibility rules applied consistently here so no individual form has to
 * remember them:
 *  - every control has a real <label>, never a placeholder standing in for one
 *  - errors are tied to the control with aria-describedby and announced politely
 *  - aria-invalid is set only when there is an error to describe
 *  - "Optional" is marked, "Required" is not — most fields are required, so
 *    marking the exceptions is less visual noise and clearer to read
 */

interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  errorId: string;
  hintId: string;
  children: ReactNode;
  className?: string;
}

function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  optional,
  errorId,
  hintId,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={htmlFor} className="text-caption font-medium text-content-secondary">
          {label}
        </label>
        {optional ? (
          <span className="text-caption text-content-faint">{COPY.form.optional}</span>
        ) : null}
      </div>

      {children}

      {hint && !error ? (
        <p id={hintId} className="text-caption text-content-faint">
          {hint}
        </p>
      ) : null}

      {/*
        The live region is always mounted, only its content changes. Mounting a
        region at the same moment its text appears means some screen readers
        miss the announcement entirely.
      */}
      <div aria-live="polite" className="min-h-0">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key={error}
              id={errorId}
              variants={feedbackMessage}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-start gap-1.5 overflow-hidden text-caption text-danger"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              >
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text input
// ---------------------------------------------------------------------------

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  wrapperClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, optional, className, wrapperClassName, ...props },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      error={error}
      hint={hint}
      optional={optional}
      errorId={errorId}
      hintId={hintId}
      className={wrapperClassName}
    >
      <input
        ref={ref}
        id={id}
        className={cn('field', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      />
    </FieldShell>
  );
});

// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------

export interface TextAreaFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Shows a live character count once past 70% of the limit. */
  maxLength?: number;
  value?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField(
    { label, error, hint, optional, maxLength, value, className, ...props },
    ref,
  ) {
    const id = useId();
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const length = typeof value === 'string' ? value.length : 0;
    // Only surface the counter when it starts to matter.
    const showCount = Boolean(maxLength) && length > (maxLength ?? 0) * 0.7;

    return (
      <FieldShell
        label={label}
        htmlFor={id}
        error={error}
        hint={hint}
        optional={optional}
        errorId={errorId}
        hintId={hintId}
      >
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            value={value}
            maxLength={maxLength}
            className={cn('field resize-y', className)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          />
          {showCount ? (
            <span
              className="numeric pointer-events-none absolute bottom-3 right-0 text-caption text-content-faint"
              aria-hidden="true"
            >
              {length} / {maxLength}
            </span>
          ) : null}
        </div>
      </FieldShell>
    );
  },
);

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

export interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, optional, options, placeholder, className, ...props },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <FieldShell
      label={label}
      htmlFor={id}
      error={error}
      hint={hint}
      optional={optional}
      errorId={errorId}
      hintId={hintId}
    >
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn('field cursor-pointer appearance-none pr-8', className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface-raised text-content-primary">
              {option.label}
            </option>
          ))}
        </select>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-content-muted"
        >
          <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </div>
    </FieldShell>
  );
});

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------

export interface CheckboxFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  label: string;
  error?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  function CheckboxField({ label, error, className, ...props }, ref) {
    const id = useId();
    const errorId = `${id}-error`;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="relative flex h-5 items-center">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              className={cn(
                'peer h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-xs',
                'border border-line-strong bg-transparent transition-colors duration-fast',
                'checked:border-gold checked:bg-gold',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-primary',
                'aria-[invalid=true]:border-danger',
                className,
              )}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              {...props}
            />
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              aria-hidden="true"
              className="pointer-events-none absolute left-[3.5px] text-black opacity-0 transition-opacity peer-checked:opacity-100"
            >
              <path d="M1 5.5L4 8.5L10 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <label htmlFor={id} className="cursor-pointer text-body-sm leading-snug text-content-secondary">
            {label}
          </label>
        </div>

        <div aria-live="polite">
          {error ? (
            <p id={errorId} className="pl-[30px] text-caption text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    );
  },
);

// ---------------------------------------------------------------------------
// Honeypot
// ---------------------------------------------------------------------------

/**
 * Bot trap.
 *
 * Hidden with CSS rather than `type="hidden"` so bots that parse the DOM still
 * fill it. `tabIndex={-1}` and `aria-hidden` keep it away from keyboard users
 * and screen readers, and `autoComplete="off"` stops browsers offering to fill
 * it for a real person.
 */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
      <label htmlFor="website-url">Do not fill this in</label>
      <input
        id="website-url"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
