# React Component Cookbook: Production-Ready Patterns

This reference provides complete, production-quality React/TypeScript component implementations. Every component handles the full state matrix, integrates design tokens via CSS custom properties, implements ARIA semantics, manages keyboard interactions, and respects `prefers-reduced-motion`. Code is ready to copy into a production codebase with minimal adaptation.

## Conventions Used Throughout

All components follow these conventions:

- **CSS Custom Properties** for all visual values. No hardcoded colors, spacing, or font sizes.
- **TypeScript interfaces** for all props with JSDoc descriptions.
- **Forwarded refs** via `React.forwardRef` where the component wraps a native element.
- **`data-state` attributes** for styling state-driven visual changes via CSS attribute selectors.
- **ARIA attributes** matching WAI-ARIA Authoring Practices.
- **`prefers-reduced-motion`** media query respected in all animated components.

---

## 1. Button

A polymorphic button supporting multiple variants, sizes, loading state, and icon positioning.

```tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Show loading spinner and disable interaction */
  isLoading?: boolean;
  /** Icon element placed before children */
  iconLeft?: React.ReactNode;
  /** Icon element placed after children */
  iconRight?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={`btn btn--${variant} btn--${size} ${fullWidth ? "btn--full" : ""} ${className ?? ""}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        data-state={isLoading ? "loading" : isDisabled ? "disabled" : "default"}
        {...props}
      >
        {isLoading && (
          <span className="btn__spinner" aria-hidden="true">
            <svg
              className="btn__spinner-icon"
              viewBox="0 0 24 24"
              fill="none"
              width="1em"
              height="1em"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </span>
        )}
        {!isLoading && iconLeft && (
          <span className="btn__icon btn__icon--left" aria-hidden="true">
            {iconLeft}
          </span>
        )}
        <span className="btn__label">{children}</span>
        {!isLoading && iconRight && (
          <span className="btn__icon btn__icon--right" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
```

**CSS (design tokens):**

```css
.btn {
  --btn-font: var(--font-family-body);
  --btn-radius: var(--radius-md);
  --btn-transition: var(--duration-fast) var(--easing-standard);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  font-family: var(--btn-font);
  font-weight: var(--font-weight-medium);
  border: 2px solid transparent;
  border-radius: var(--btn-radius);
  cursor: pointer;
  transition: background var(--btn-transition), color var(--btn-transition),
    border-color var(--btn-transition), box-shadow var(--btn-transition);
  user-select: none;
  line-height: 1;
  white-space: nowrap;
}

.btn--sm { padding: var(--space-xs) var(--space-sm); font-size: var(--font-size-sm); }
.btn--md { padding: var(--space-sm) var(--space-md); font-size: var(--font-size-base); }
.btn--lg { padding: var(--space-md) var(--space-lg); font-size: var(--font-size-lg); }
.btn--full { width: 100%; }

.btn--primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.btn--primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.btn--primary:active:not(:disabled) { background: var(--color-primary-active); }

.btn--secondary {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn--secondary:hover:not(:disabled) { background: var(--color-primary-subtle); }

.btn--ghost {
  background: transparent;
  color: var(--color-on-surface);
}
.btn--ghost:hover:not(:disabled) { background: var(--color-surface-hover); }

.btn--danger {
  background: var(--color-error);
  color: var(--color-on-error);
}
.btn--danger:hover:not(:disabled) { background: var(--color-error-hover); }

.btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn__spinner-icon {
  animation: spin 0.8s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .btn__spinner-icon {
    animation: none;
    opacity: 0.7;
  }
}
```

**Usage:**

```tsx
<Button variant="primary" isLoading={isSaving} onClick={handleSave}>
  Save Changes
</Button>
<Button variant="danger" iconLeft={<TrashIcon />}>Delete</Button>
<Button variant="ghost" size="sm">Cancel</Button>
```

---

## 2. TextInput

A text input with floating label, validation states, helper text, character count, and password visibility toggle.

```tsx
import React, { useState, useId } from "react";

interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Visible label text */
  label: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Error message — overrides helperText when present */
  errorMessage?: string;
  /** Success message — overrides helperText when present */
  successMessage?: string;
  /** Maximum character count to display */
  maxCharacters?: number;
  /** Visual size */
  size?: "sm" | "md" | "lg";
  /** Show password toggle for type="password" */
  showPasswordToggle?: boolean;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      successMessage,
      maxCharacters,
      size = "md",
      showPasswordToggle = false,
      type = "text",
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      className,
      id: externalId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = externalId ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const [showPassword, setShowPassword] = useState(false);

    const currentValue = value !== undefined ? String(value) : String(internalValue);
    const charCount = currentValue.length;
    const hasError = Boolean(errorMessage);
    const hasSuccess = Boolean(successMessage) && !hasError;
    const isPassword = type === "password";

    const validationState = hasError
      ? "error"
      : hasSuccess
        ? "success"
        : "default";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const resolvedType =
      isPassword && showPassword ? "text" : type;

    const descriptionId = hasError ? errorId : helperText ? helperId : undefined;

    return (
      <div
        className={`text-input text-input--${size} text-input--${validationState} ${className ?? ""}`}
        data-state={validationState}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
      >
        <div className="text-input__field-wrapper">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className="text-input__field"
            value={value}
            defaultValue={value === undefined ? defaultValue : undefined}
            onChange={handleChange}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={hasError}
            aria-describedby={descriptionId}
            placeholder=" "
            {...props}
          />
          <label htmlFor={inputId} className="text-input__label">
            {label}
          </label>
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              className="text-input__toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        <div className="text-input__footer">
          {hasError && (
            <span id={errorId} className="text-input__error" role="alert">
              {errorMessage}
            </span>
          )}
          {!hasError && hasSuccess && (
            <span className="text-input__success">{successMessage}</span>
          )}
          {!hasError && !hasSuccess && helperText && (
            <span id={helperId} className="text-input__helper">
              {helperText}
            </span>
          )}
          {maxCharacters !== undefined && (
            <span
              className="text-input__count"
              aria-live="polite"
              aria-label={`${charCount} of ${maxCharacters} characters`}
            >
              {charCount}/{maxCharacters}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
export { TextInput };
export type { TextInputProps };
```

**CSS:**

```css
.text-input__field-wrapper {
  position: relative;
}

.text-input__field {
  width: 100%;
  padding: var(--space-md) var(--space-sm);
  padding-top: calc(var(--space-md) + 6px);
  font-family: var(--font-family-body);
  font-size: var(--font-size-base);
  color: var(--color-on-surface);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--duration-fast) var(--easing-standard);
}

.text-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.text-input__label {
  position: absolute;
  left: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  pointer-events: none;
  transition: all var(--duration-fast) var(--easing-standard);
  transform-origin: left center;
}

.text-input__field:focus + .text-input__label,
.text-input__field:not(:placeholder-shown) + .text-input__label {
  top: 8px;
  transform: translateY(0) scale(0.75);
  color: var(--color-primary);
}

.text-input--error .text-input__field {
  border-color: var(--color-error);
}
.text-input--error .text-input__field:focus {
  box-shadow: 0 0 0 3px var(--color-error-subtle);
}

.text-input--success .text-input__field {
  border-color: var(--color-success);
}

.text-input__footer {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-xxs);
  font-size: var(--font-size-sm);
}

.text-input__error { color: var(--color-error); }
.text-input__success { color: var(--color-success); }
.text-input__helper { color: var(--color-text-secondary); }

.text-input__toggle {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--space-xxs);
}
```

**Usage:**

```tsx
<TextInput
  label="Email Address"
  type="email"
  helperText="We will never share your email"
  errorMessage={errors.email}
  maxCharacters={100}
/>
<TextInput
  label="Password"
  type="password"
  showPasswordToggle
  errorMessage={errors.password}
/>
```

---

## 3. Select / Combobox

A searchable select with keyboard navigation, option groups, multi-select, and ARIA combobox semantics.

```tsx
import React, { useState, useRef, useEffect, useId, useCallback } from "react";

interface Option {
  value: string;
  label: string;
  group?: string;
  disabled?: boolean;
}

interface ComboboxProps {
  /** Visible label */
  label: string;
  /** List of options */
  options: Option[];
  /** Controlled value (single-select) */
  value?: string;
  /** Controlled values (multi-select) */
  values?: string[];
  /** Enable multi-select mode */
  multiple?: boolean;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Callback when values change (multi) */
  onMultiChange?: (values: string[]) => void;
  /** Allow typing to filter options */
  searchable?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  errorMessage?: string;
}

function Combobox({
  label,
  options,
  value,
  values = [],
  multiple = false,
  onChange,
  onMultiChange,
  searchable = true,
  placeholder = "Select an option",
  disabled = false,
  errorMessage,
}: ComboboxProps) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const inputId = `${id}-input`;
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Option[]>>((acc, opt) => {
    const group = opt.group ?? "__ungrouped__";
    if (!acc[group]) acc[group] = [];
    acc[group].push(opt);
    return acc;
  }, {});

  const flatFiltered = filtered.filter((o) => !o.disabled);

  const selectedLabel = multiple
    ? values
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean)
        .join(", ")
    : options.find((o) => o.value === value)?.label ?? "";

  const open = () => {
    if (disabled) return;
    setIsOpen(true);
    setActiveIndex(-1);
    setQuery("");
  };

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  };

  const selectOption = useCallback(
    (opt: Option) => {
      if (opt.disabled) return;
      if (multiple) {
        const next = values.includes(opt.value)
          ? values.filter((v) => v !== opt.value)
          : [...values, opt.value];
        onMultiChange?.(next);
      } else {
        onChange?.(opt.value);
        close();
      }
    },
    [multiple, values, onChange, onMultiChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setActiveIndex((prev) =>
            prev < flatFiltered.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : flatFiltered.length - 1
          );
        }
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && flatFiltered[activeIndex]) {
          selectOption(flatFiltered[activeIndex]);
        } else if (!isOpen) {
          open();
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        inputRef.current?.focus();
        break;
      case "Home":
        if (isOpen) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (isOpen) {
          e.preventDefault();
          setActiveIndex(flatFiltered.length - 1);
        }
        break;
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      ) as HTMLElement | null;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const activeOptionId =
    activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;

  return (
    <div
      ref={containerRef}
      className={`combobox ${errorMessage ? "combobox--error" : ""}`}
    >
      <label id={labelId} className="combobox__label">
        {label}
      </label>
      <div className="combobox__control" onKeyDown={handleKeyDown}>
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-labelledby={labelId}
          aria-activedescendant={activeOptionId}
          aria-autocomplete={searchable ? "list" : "none"}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          className="combobox__input"
          value={isOpen && searchable ? query : selectedLabel}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={!searchable}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onClick={() => (isOpen ? close() : open())}
        />
        <span className="combobox__arrow" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M3 5l3 3 3-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          aria-multiselectable={multiple}
          className="combobox__listbox"
        >
          {Object.entries(grouped).map(([groupName, groupOptions]) => {
            const isGrouped = groupName !== "__ungrouped__";
            return (
              <React.Fragment key={groupName}>
                {isGrouped && (
                  <li role="presentation" className="combobox__group-label">
                    {groupName}
                  </li>
                )}
                {groupOptions.map((opt) => {
                  const flatIndex = flatFiltered.indexOf(opt);
                  const isActive = flatIndex === activeIndex;
                  const isSelected = multiple
                    ? values.includes(opt.value)
                    : opt.value === value;

                  return (
                    <li
                      key={opt.value}
                      id={`${id}-option-${flatIndex}`}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled}
                      data-index={flatIndex}
                      className={`combobox__option ${isActive ? "combobox__option--active" : ""} ${isSelected ? "combobox__option--selected" : ""} ${opt.disabled ? "combobox__option--disabled" : ""}`}
                      onClick={() => selectOption(opt)}
                    >
                      {multiple && (
                        <span
                          className="combobox__check"
                          aria-hidden="true"
                        >
                          {isSelected ? "\u2713" : ""}
                        </span>
                      )}
                      {opt.label}
                    </li>
                  );
                })}
              </React.Fragment>
            );
          })}
          {filtered.length === 0 && (
            <li className="combobox__empty" role="presentation">
              No results found
            </li>
          )}
        </ul>
      )}
      {errorMessage && (
        <span id={errorId} className="combobox__error" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

export { Combobox };
export type { ComboboxProps, Option };
```

**Usage:**

```tsx
<Combobox
  label="Country"
  options={[
    { value: "us", label: "United States", group: "Americas" },
    { value: "ca", label: "Canada", group: "Americas" },
    { value: "gb", label: "United Kingdom", group: "Europe" },
    { value: "de", label: "Germany", group: "Europe" },
  ]}
  value={country}
  onChange={setCountry}
  searchable
/>
```

---

## 4. Modal / Dialog

A focus-trapping dialog with scroll lock, Escape dismissal, overlay click close, and responsive bottom-sheet behavior on mobile.

```tsx
import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Accessible title */
  title: string;
  /** Optional description */
  description?: string;
  /** Content */
  children: React.ReactNode;
  /** Footer actions */
  footer?: React.ReactNode;
  /** Size */
  size?: "sm" | "md" | "lg" | "full";
  /** Prevent closing on overlay click */
  preventOverlayClose?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
}

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  preventOverlayClose = false,
  showCloseButton = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!dialogRef.current) return [];
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled"));
  }, []);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      requestAnimationFrame(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current?.focus();
        }
      });
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, getFocusableElements]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, getFocusableElements]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={preventOverlayClose ? undefined : onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={`modal modal--${size}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {title}
          </h2>
          {showCloseButton && (
            <button
              className="modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </header>
        {description && (
          <p id="modal-description" className="modal__description">
            {description}
          </p>
        )}
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

export { Modal };
export type { ModalProps };
```

**CSS:**

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: var(--z-modal);
  padding: var(--space-md);
  animation: fadeIn var(--duration-fast) var(--easing-decelerate);
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: calc(100vh - var(--space-xl) * 2);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: slideUp var(--duration-normal) var(--easing-decelerate);
}

.modal--sm { width: min(400px, 100%); }
.modal--md { width: min(560px, 100%); }
.modal--lg { width: min(720px, 100%); }
.modal--full { width: 100%; height: 100%; border-radius: 0; }

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-lg) 0;
}

.modal__title { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin: 0; }
.modal__description { padding: var(--space-sm) var(--space-lg) 0; color: var(--color-text-secondary); margin: 0; }
.modal__body { padding: var(--space-lg); flex: 1; overflow-y: auto; }
.modal__footer { padding: 0 var(--space-lg) var(--space-lg); display: flex; gap: var(--space-sm); justify-content: flex-end; }

.modal__close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
}
.modal__close:hover { background: var(--color-surface-hover); }
.modal__close:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }

@container (max-width: 480px) {
  .modal {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    max-height: 90vh;
    width: 100%;
    animation: slideUpSheet var(--duration-normal) var(--easing-decelerate);
  }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUpSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  .modal-overlay, .modal { animation: none; }
}
```

**Usage:**

```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Deletion"
  description="This action cannot be undone."
  footer={
    <>
      <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  <p>Are you sure you want to delete this project and all of its data?</p>
</Modal>
```

---

## 5. Toast / Notification

A toast notification system with a queue, auto-dismiss, screen reader live region, and dismiss animation.

```tsx
import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from "react";
import { createPortal } from "react-dom";

type ToastVariant = "info" | "success" | "warning" | "error";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let toastCounter = 0;

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <div className="toast-container" aria-live="polite" aria-relevant="additions">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const dismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      timerRef.current = setTimeout(dismiss, duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.duration, dismiss]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      timerRef.current = setTimeout(dismiss, duration);
    }
  };

  const iconMap: Record<ToastVariant, string> = {
    info: "\u2139\uFE0F",
    success: "\u2714",
    warning: "\u26A0",
    error: "\u2718",
  };

  return (
    <div
      role="status"
      className={`toast toast--${toast.variant} ${isExiting ? "toast--exiting" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="toast__icon" aria-hidden="true">
        {iconMap[toast.variant]}
      </span>
      <span className="toast__message">{toast.message}</span>
      {toast.action && (
        <button
          className="toast__action"
          onClick={() => {
            toast.action?.onClick();
            dismiss();
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button
        className="toast__dismiss"
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="4" x2="4" y2="12" />
          <line x1="4" y1="4" x2="12" y2="12" />
        </svg>
      </button>
    </div>
  );
}

export { ToastProvider, useToast };
export type { Toast, ToastVariant };
```

**CSS:**

```css
.toast-container {
  position: fixed;
  bottom: var(--space-lg);
  right: var(--space-lg);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column-reverse;
  gap: var(--space-sm);
  max-width: 420px;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-lg);
  border-left: 4px solid;
  animation: toastIn var(--duration-normal) var(--easing-decelerate);
}

.toast--info { border-color: var(--color-info); }
.toast--success { border-color: var(--color-success); }
.toast--warning { border-color: var(--color-warning); }
.toast--error { border-color: var(--color-error); }

.toast--exiting { animation: toastOut 0.3s var(--easing-accelerate) forwards; }

.toast__message { flex: 1; font-size: var(--font-size-sm); color: var(--color-on-surface); }
.toast__action {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  padding: var(--space-xxs) var(--space-xs);
  border-radius: var(--radius-sm);
}
.toast__action:hover { background: var(--color-primary-subtle); }
.toast__dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--space-xxs);
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .toast, .toast--exiting { animation-duration: 0.01ms; }
}
```

**Usage:**

```tsx
function SaveButton() {
  const { addToast } = useToast();
  return (
    <Button
      onClick={() =>
        addToast({
          message: "Document saved successfully.",
          variant: "success",
          duration: 4000,
          action: { label: "Undo", onClick: () => undoSave() },
        })
      }
    >
      Save
    </Button>
  );
}
```

---

## 6. Form

A form component with inline validation, field-level errors, form-level summary, and submission state management.

```tsx
import React, { useState, useCallback, FormEvent } from "react";

interface FieldError {
  field: string;
  message: string;
}

type FormStatus = "idle" | "validating" | "submitting" | "success" | "error";

interface FormProps {
  /** Called with form data on valid submission */
  onSubmit: (data: FormData) => Promise<void>;
  /** Validation function returning array of errors */
  validate?: (data: FormData) => FieldError[];
  /** Content */
  children: (context: FormContext) => React.ReactNode;
  /** Reset after successful submission */
  resetOnSuccess?: boolean;
}

interface FormContext {
  status: FormStatus;
  errors: FieldError[];
  getFieldError: (fieldName: string) => string | undefined;
  formError: string | null;
}

function Form({ onSubmit, validate, children, resetOnSuccess = false }: FormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const getFieldError = useCallback(
    (fieldName: string) => errors.find((e) => e.field === fieldName)?.message,
    [errors]
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const formElement = e.currentTarget;

    if (validate) {
      setStatus("validating");
      const validationErrors = validate(formData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setStatus("error");
        const firstErrorField = formElement.querySelector(
          `[name="${validationErrors[0].field}"]`
        ) as HTMLElement | null;
        firstErrorField?.focus();
        return;
      }
    }

    setErrors([]);
    setStatus("submitting");

    try {
      await onSubmit(formData);
      setStatus("success");
      if (resetOnSuccess) {
        formElement.reset();
      }
    } catch (err) {
      setStatus("error");
      setFormError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  };

  const context: FormContext = { status, errors, getFieldError, formError };

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      {errors.length > 0 && (
        <div
          className="form__error-summary"
          role="alert"
          aria-label="Form errors"
        >
          <p className="form__error-summary-title">
            Please fix the following {errors.length} error{errors.length > 1 ? "s" : ""}:
          </p>
          <ul className="form__error-list">
            {errors.map((err) => (
              <li key={err.field}>
                <a href={`#${err.field}`} className="form__error-link">
                  {err.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {formError && (
        <div className="form__error-banner" role="alert">
          {formError}
        </div>
      )}
      {status === "success" && (
        <div className="form__success-banner" role="status">
          Form submitted successfully.
        </div>
      )}
      <fieldset disabled={status === "submitting"} className="form__fieldset">
        {children(context)}
      </fieldset>
    </form>
  );
}

export { Form };
export type { FormProps, FormContext, FieldError, FormStatus };
```

**Usage:**

```tsx
<Form
  onSubmit={async (data) => {
    await api.createUser({
      name: data.get("name") as string,
      email: data.get("email") as string,
    });
  }}
  validate={(data) => {
    const errors: FieldError[] = [];
    if (!data.get("name")) errors.push({ field: "name", message: "Name is required" });
    const email = data.get("email") as string;
    if (!email) errors.push({ field: "email", message: "Email is required" });
    else if (!email.includes("@")) errors.push({ field: "email", message: "Enter a valid email" });
    return errors;
  }}
>
  {({ status, getFieldError }) => (
    <>
      <TextInput name="name" label="Full Name" errorMessage={getFieldError("name")} />
      <TextInput name="email" label="Email" type="email" errorMessage={getFieldError("email")} />
      <Button type="submit" isLoading={status === "submitting"}>
        Create Account
      </Button>
    </>
  )}
</Form>
```

---

## 7. EmptyState

A flexible empty state with illustration slot, primary/secondary actions, and type presets.

```tsx
import React from "react";

type EmptyStateType = "no-data" | "no-results" | "error" | "first-use";

interface EmptyStateProps {
  /** Type determines default icon and messaging tone */
  type?: EmptyStateType;
  /** Custom illustration or icon */
  illustration?: React.ReactNode;
  /** Heading text */
  title: string;
  /** Descriptive body text */
  description?: string;
  /** Primary CTA */
  primaryAction?: { label: string; onClick: () => void };
  /** Secondary CTA */
  secondaryAction?: { label: string; onClick: () => void };
}

const defaultIllustrations: Record<EmptyStateType, React.ReactNode> = {
  "no-data": (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <rect x="20" y="30" width="80" height="60" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="60" cy="60" r="12" stroke="currentColor" strokeWidth="2" />
      <line x1="54" y1="60" x2="66" y2="60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  "no-results": (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="52" cy="52" r="24" stroke="currentColor" strokeWidth="2" />
      <line x1="70" y1="70" x2="92" y2="92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="52" x2="60" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="32" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="44" x2="60" y2="64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="74" r="2" fill="currentColor" />
    </svg>
  ),
  "first-use": (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <rect x="30" y="20" width="60" height="80" rx="8" stroke="currentColor" strokeWidth="2" />
      <line x1="44" y1="44" x2="76" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="56" x2="68" y2="56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="78" r="8" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="74" x2="60" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="56" y1="78" x2="64" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

function EmptyState({
  type = "no-data",
  illustration,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__illustration">
        {illustration ?? defaultIllustrations[type]}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="empty-state__actions">
          {primaryAction && (
            <button
              className="btn btn--primary btn--md"
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              className="btn btn--ghost btn--md"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps, EmptyStateType };
```

**CSS:**

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  color: var(--color-text-secondary);
}

.empty-state__illustration { margin-bottom: var(--space-lg); opacity: 0.5; }
.empty-state__title { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-on-surface); margin: 0 0 var(--space-xs); }
.empty-state__description { font-size: var(--font-size-base); max-width: 360px; margin: 0 0 var(--space-lg); line-height: var(--line-height-relaxed); }
.empty-state__actions { display: flex; gap: var(--space-sm); }
```

**Usage:**

```tsx
<EmptyState
  type="no-results"
  title="No matching results"
  description="Try adjusting your search terms or clearing filters."
  primaryAction={{ label: "Clear Filters", onClick: clearFilters }}
  secondaryAction={{ label: "New Search", onClick: openSearch }}
/>
```

---

## 8. Skeleton

Composable skeleton primitives with pulse and shimmer variants for building loading screens.

```tsx
import React from "react";

interface SkeletonProps {
  /** Width (CSS value) */
  width?: string;
  /** Height (CSS value) */
  height?: string;
  /** Border radius variant */
  variant?: "text" | "circular" | "rectangular" | "rounded";
  /** Animation style */
  animation?: "pulse" | "shimmer" | "none";
  /** Additional class */
  className?: string;
}

function Skeleton({
  width,
  height,
  variant = "text",
  animation = "pulse",
  className,
}: SkeletonProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    text: { borderRadius: "var(--radius-sm)", height: height ?? "1em", width: width ?? "100%" },
    circular: { borderRadius: "50%", width: width ?? "40px", height: height ?? width ?? "40px" },
    rectangular: { borderRadius: "0", width: width ?? "100%", height: height ?? "120px" },
    rounded: { borderRadius: "var(--radius-md)", width: width ?? "100%", height: height ?? "120px" },
  };

  return (
    <div
      className={`skeleton skeleton--${animation} ${className ?? ""}`}
      style={variantStyles[variant]}
      role="presentation"
      aria-hidden="true"
    />
  );
}

function SkeletonGroup({
  children,
  isLoading,
  fallback,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  fallback: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading content">
        {fallback}
      </div>
    );
  }
  return <>{children}</>;
}

export { Skeleton, SkeletonGroup };
export type { SkeletonProps };
```

**CSS:**

```css
.skeleton {
  background: var(--color-surface-hover);
  position: relative;
  overflow: hidden;
}

.skeleton--pulse {
  animation: skeletonPulse 1.8s ease-in-out infinite;
}

.skeleton--shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-surface-elevated) 50%,
    transparent 100%
  );
  animation: skeletonShimmer 1.8s ease-in-out infinite;
}

@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes skeletonShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton--pulse { animation: none; opacity: 0.6; }
  .skeleton--shimmer::after { animation: none; display: none; }
}
```

**Usage:**

```tsx
<SkeletonGroup isLoading={isLoading} fallback={
  <div style={{ display: "flex", gap: "var(--space-md)", alignItems: "center" }}>
    <Skeleton variant="circular" width="48px" />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
    </div>
  </div>
}>
  <UserProfile user={user} />
</SkeletonGroup>
```

---

## 9. DataTable

A sortable, paginated data table with row selection, responsive collapse, and loading/empty states.

```tsx
import React, { useState, useMemo, useId } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

type SortDirection = "asc" | "desc" | null;

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Unique key extractor for each row */
  rowKey: (row: T) => string;
  /** Enable row selection */
  selectable?: boolean;
  /** Controlled selected row keys */
  selectedKeys?: Set<string>;
  /** Selection change handler */
  onSelectionChange?: (keys: Set<string>) => void;
  /** Rows per page (0 = no pagination) */
  pageSize?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Custom empty state */
  emptyContent?: React.ReactNode;
  /** Accessible table caption */
  caption?: string;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  pageSize = 10,
  isLoading = false,
  emptyContent,
  caption,
}: DataTableProps<T>) {
  const id = useId();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const paginated = pageSize > 0 ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const allSelected = paginated.length > 0 && paginated.every((row) => selectedKeys.has(rowKey(row)));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      const next = new Set(selectedKeys);
      paginated.forEach((row) => next.delete(rowKey(row)));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedKeys);
      paginated.forEach((row) => next.add(rowKey(row)));
      onSelectionChange(next);
    }
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const getSortLabel = (key: string) => {
    if (sortKey !== key || !sortDir) return "Sort";
    return sortDir === "asc" ? "Sorted ascending" : "Sorted descending";
  };

  return (
    <div className="data-table-wrapper" aria-busy={isLoading}>
      <table className="data-table" role="table">
        {caption && <caption className="data-table__caption">{caption}</caption>}
        <thead>
          <tr>
            {selectable && (
              <th className="data-table__th data-table__th--checkbox" scope="col">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`data-table__th ${col.sortable ? "data-table__th--sortable" : ""}`}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                aria-sort={
                  sortKey === col.key && sortDir
                    ? sortDir === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {col.sortable ? (
                  <button
                    className="data-table__sort-btn"
                    onClick={() => handleSort(col.key)}
                    aria-label={`${col.header}, ${getSortLabel(col.key)}`}
                  >
                    {col.header}
                    <span className="data-table__sort-icon" aria-hidden="true">
                      {sortKey === col.key && sortDir === "asc" && "\u25B2"}
                      {sortKey === col.key && sortDir === "desc" && "\u25BC"}
                      {(sortKey !== col.key || !sortDir) && "\u25B4\u25BE"}
                    </span>
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: pageSize || 5 }).map((_, i) => (
              <tr key={`skel-${i}`} className="data-table__row data-table__row--skeleton">
                {selectable && (
                  <td className="data-table__td">
                    <div className="skeleton skeleton--pulse" style={{ width: 16, height: 16 }} />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="data-table__td">
                    <div className="skeleton skeleton--pulse" style={{ width: "80%", height: "1em" }} />
                  </td>
                ))}
              </tr>
            ))}
          {!isLoading && paginated.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="data-table__empty">
                {emptyContent ?? "No data to display."}
              </td>
            </tr>
          )}
          {!isLoading &&
            paginated.map((row) => {
              const key = rowKey(row);
              const isSelected = selectedKeys.has(key);
              return (
                <tr
                  key={key}
                  className={`data-table__row ${isSelected ? "data-table__row--selected" : ""}`}
                  aria-selected={selectable ? isSelected : undefined}
                >
                  {selectable && (
                    <td className="data-table__td data-table__td--checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        aria-label={`Select row ${key}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="data-table__td" data-label={col.header}>
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
      {pageSize > 0 && totalPages > 1 && (
        <nav className="data-table__pagination" aria-label="Table pagination">
          <button
            className="data-table__page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="data-table__page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="data-table__page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

export { DataTable };
export type { DataTableProps, Column };
```

**Usage:**

```tsx
<DataTable
  caption="Team members"
  columns={[
    { key: "name", header: "Name", sortable: true },
    { key: "email", header: "Email", sortable: true },
    { key: "role", header: "Role", sortable: true, render: (row) => <Badge>{row.role}</Badge> },
  ]}
  data={users}
  rowKey={(row) => row.id}
  selectable
  selectedKeys={selected}
  onSelectionChange={setSelected}
  pageSize={20}
  isLoading={isLoading}
/>
```

---

## 10. Accordion

An accordion with single/multi expand modes, keyboard navigation, and animated height transitions.

```tsx
import React, { useState, useRef, useEffect, useId } from "react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple panels open simultaneously */
  multiple?: boolean;
  /** Controlled open item IDs */
  openIds?: string[];
  /** Change handler */
  onToggle?: (openIds: string[]) => void;
}

function Accordion({ items, multiple = false, openIds: controlledIds, onToggle }: AccordionProps) {
  const [internalIds, setInternalIds] = useState<string[]>([]);
  const openIds = controlledIds ?? internalIds;
  const baseId = useId();

  const toggle = (id: string) => {
    let next: string[];
    if (openIds.includes(id)) {
      next = openIds.filter((i) => i !== id);
    } else {
      next = multiple ? [...openIds, id] : [id];
    }
    if (onToggle) onToggle(next);
    else setInternalIds(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledItems = items.filter((i) => !i.disabled);
    const currentEnabledIndex = enabledItems.findIndex((i) => i.id === items[index].id);

    let targetIndex = -1;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        targetIndex = (currentEnabledIndex + 1) % enabledItems.length;
        break;
      case "ArrowUp":
        e.preventDefault();
        targetIndex = (currentEnabledIndex - 1 + enabledItems.length) % enabledItems.length;
        break;
      case "Home":
        e.preventDefault();
        targetIndex = 0;
        break;
      case "End":
        e.preventDefault();
        targetIndex = enabledItems.length - 1;
        break;
      default:
        return;
    }

    const targetId = enabledItems[targetIndex]?.id;
    if (targetId) {
      const btn = document.getElementById(`${baseId}-trigger-${targetId}`);
      btn?.focus();
    }
  };

  return (
    <div className="accordion" role="presentation">
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={`accordion__item ${isOpen ? "accordion__item--open" : ""} ${item.disabled ? "accordion__item--disabled" : ""}`}
          >
            <h3 className="accordion__heading">
              <button
                id={triggerId}
                className="accordion__trigger"
                onClick={() => !item.disabled && toggle(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-disabled={item.disabled}
                disabled={item.disabled}
              >
                <span className="accordion__title">{item.title}</span>
                <span className="accordion__icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="4,6 8,10 12,6" />
                  </svg>
                </span>
              </button>
            </h3>
            <AccordionPanel id={panelId} labelledBy={triggerId} isOpen={isOpen}>
              {item.content}
            </AccordionPanel>
          </div>
        );
      })}
    </div>
  );
}

function AccordionPanel({
  id,
  labelledBy,
  isOpen,
  children,
}: {
  id: string;
  labelledBy: string;
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">(isOpen ? "auto" : 0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (isOpen) {
      const measuredHeight = contentRef.current.scrollHeight;
      setHeight(measuredHeight);
      const timer = setTimeout(() => setHeight("auto"), 300);
      return () => clearTimeout(timer);
    } else {
      const measuredHeight = contentRef.current.scrollHeight;
      setHeight(measuredHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [isOpen]);

  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      className="accordion__panel"
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        overflow: "hidden",
        transition: "height var(--duration-normal) var(--easing-standard)",
      }}
      hidden={!isOpen && height === 0}
    >
      <div ref={contentRef} className="accordion__content">
        {children}
      </div>
    </div>
  );
}

export { Accordion };
export type { AccordionProps, AccordionItem };
```

**Usage:**

```tsx
<Accordion
  multiple
  items={[
    { id: "shipping", title: "Shipping Information", content: <ShippingDetails /> },
    { id: "payment", title: "Payment Methods", content: <PaymentOptions /> },
    { id: "returns", title: "Returns & Exchanges", content: <ReturnsPolicy /> },
  ]}
/>
```

---

## 11. Tabs

Keyboard-navigable tabs with arrow key movement, lazy panel rendering, and overflow scroll.

```tsx
import React, { useState, useRef, useId } from "react";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  /** Controlled active tab */
  activeId?: string;
  /** Change handler */
  onChange?: (id: string) => void;
  /** Only render active panel content */
  lazy?: boolean;
  /** Visual variant */
  variant?: "underline" | "pills" | "enclosed";
}

function Tabs({
  tabs,
  activeId: controlledId,
  onChange,
  lazy = false,
  variant = "underline",
}: TabsProps) {
  const baseId = useId();
  const [internalId, setInternalId] = useState(tabs[0]?.id ?? "");
  const activeId = controlledId ?? internalId;
  const tablistRef = useRef<HTMLDivElement>(null);
  const [renderedIds] = useState<Set<string>>(() => new Set([activeId]));

  const setActive = (id: string) => {
    if (onChange) onChange(id);
    else setInternalId(id);
    renderedIds.add(id);
  };

  const enabledTabs = tabs.filter((t) => !t.disabled);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = enabledTabs.findIndex((t) => t.id === activeId);
    let targetIndex = -1;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        targetIndex = (currentIndex + 1) % enabledTabs.length;
        break;
      case "ArrowLeft":
        e.preventDefault();
        targetIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
        break;
      case "Home":
        e.preventDefault();
        targetIndex = 0;
        break;
      case "End":
        e.preventDefault();
        targetIndex = enabledTabs.length - 1;
        break;
      default:
        return;
    }

    const target = enabledTabs[targetIndex];
    if (target) {
      setActive(target.id);
      const btn = document.getElementById(`${baseId}-tab-${target.id}`);
      btn?.focus();
    }
  };

  return (
    <div className={`tabs tabs--${variant}`}>
      <div
        ref={tablistRef}
        role="tablist"
        className="tabs__list"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              role="tab"
              className={`tabs__tab ${isActive ? "tabs__tab--active" : ""}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => setActive(tab.id)}
            >
              {tab.icon && (
                <span className="tabs__icon" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const shouldRender = lazy ? renderedIds.has(tab.id) : true;

        return (
          <div
            key={tab.id}
            id={`${baseId}-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            className="tabs__panel"
            hidden={!isActive}
            tabIndex={0}
          >
            {shouldRender && tab.content}
          </div>
        );
      })}
    </div>
  );
}

export { Tabs };
export type { TabsProps, TabItem };
```

**CSS:**

```css
.tabs__list {
  display: flex;
  gap: var(--space-xxs);
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  border-bottom: 1px solid var(--color-border);
}
.tabs__list::-webkit-scrollbar { display: none; }

.tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: color var(--duration-fast), border-color var(--duration-fast);
  margin-bottom: -1px;
}

.tabs__tab:hover:not(:disabled) { color: var(--color-on-surface); }
.tabs__tab--active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.tabs__tab:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: -2px; border-radius: var(--radius-sm); }
.tabs__tab:disabled { opacity: 0.4; cursor: not-allowed; }

.tabs--pills .tabs__list { border-bottom: none; }
.tabs--pills .tabs__tab { border-bottom: none; border-radius: var(--radius-full); }
.tabs--pills .tabs__tab--active { background: var(--color-primary); color: var(--color-on-primary); }

.tabs__panel { padding: var(--space-lg) 0; }
.tabs__panel:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; border-radius: var(--radius-sm); }
```

**Usage:**

```tsx
<Tabs
  lazy
  tabs={[
    { id: "overview", label: "Overview", content: <OverviewPanel /> },
    { id: "analytics", label: "Analytics", icon: <ChartIcon />, content: <AnalyticsPanel /> },
    { id: "settings", label: "Settings", content: <SettingsPanel /> },
  ]}
/>
```

---

## 12. Tooltip

A keyboard-accessible tooltip with configurable placement, delay, and portal rendering.

```tsx
import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";

type Placement = "top" | "right" | "bottom" | "left";

interface TooltipProps {
  /** Tooltip text content */
  content: string;
  /** Preferred placement */
  placement?: Placement;
  /** Delay in ms before showing */
  delay?: number;
  /** Trigger element (must accept ref and event handlers) */
  children: React.ReactElement;
}

function Tooltip({ content, placement = "top", delay = 300, children }: TooltipProps) {
  const id = useId();
  const tooltipId = `${id}-tooltip`;
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    const positions: Record<Placement, { top: number; left: number }> = {
      top: {
        top: triggerRect.top - tooltipRect.height - gap + window.scrollY,
        left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + window.scrollX,
      },
      bottom: {
        top: triggerRect.bottom + gap + window.scrollY,
        left: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + window.scrollX,
      },
      left: {
        top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + window.scrollY,
        left: triggerRect.left - tooltipRect.width - gap + window.scrollX,
      },
      right: {
        top: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + window.scrollY,
        left: triggerRect.right + gap + window.scrollX,
      },
    };

    let chosen = positions[placement];

    if (chosen.top < window.scrollY) chosen = positions.bottom;
    if (chosen.left < 0) chosen = positions.right;
    if (chosen.left + tooltipRect.width > window.innerWidth) chosen = positions.left;

    setPosition(chosen);
  }, [isVisible, placement]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const child = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      children.props.onBlur?.(e);
    },
    "aria-describedby": isVisible ? tooltipId : undefined,
  });

  return (
    <>
      {child}
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            className={`tooltip tooltip--${placement}`}
            style={{
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}

export { Tooltip };
export type { TooltipProps, Placement };
```

**CSS:**

```css
.tooltip {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface-inverted);
  color: var(--color-on-surface-inverted);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  pointer-events: none;
  z-index: var(--z-tooltip);
  max-width: 240px;
  line-height: var(--line-height-normal);
  animation: tooltipIn var(--duration-fast) var(--easing-decelerate);
}

@keyframes tooltipIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .tooltip { animation: none; }
}
```

**Usage:**

```tsx
<Tooltip content="Save your changes (Ctrl+S)" placement="bottom">
  <button className="btn btn--primary btn--md">Save</button>
</Tooltip>
```
