"use client";

import CurrencyInput from "react-currency-input-field";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface CurrencyFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  id?: string;
  invalid?: boolean;
  placeholder?: string;
}

export default function CurrencyField<T extends FieldValues>({
  name,
  control,
  id,
  invalid = false,
  placeholder = "0,00",
}: CurrencyFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="input-group">
          <span className="input-group-text">R$</span>
          <CurrencyInput
            id={id}
            className={`form-control ${invalid ? "is-invalid" : ""}`}
            placeholder={placeholder}
            decimalSeparator=","
            groupSeparator="."
            decimalsLimit={2}
            allowNegativeValue={false}
            value={field.value ?? ""}
            onValueChange={(_value, _name, values) =>
              field.onChange(values?.float ?? undefined)
            }
            onBlur={field.onBlur}
          />
        </div>
      )}
    />
  );
}
