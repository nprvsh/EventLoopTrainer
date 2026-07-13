import s from "./TokenPicker.module.css";

type TokenPickerProps = {
  tokens: string[];
  usedIndices: Set<number>;
  disabled: boolean;
  onPlace: (index: number) => void;
}

export default function TokenPicker({ tokens, usedIndices, disabled, onPlace }: TokenPickerProps) {
  return (
    <div className={s.tokens}>
      <div className={s.tokensLabel}>НАЖИМАЙ В ТОМ ПОРЯДКЕ, В КОТОРОМ ПОЯВИТСЯ ВЫВОД</div>
      <div className={s.tokensRow}>
        {tokens.map((token, index) => {
          const isUsed = usedIndices.has(index);
          return <button key={index} className={`${s.chip} ${isUsed ? s.chipUsed : ""}`} disabled={isUsed || disabled} onClick={() => onPlace(index)}>&apos;{token}&apos;</button>;
        })}
      </div>
    </div>
  );
}
