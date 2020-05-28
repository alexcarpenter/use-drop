import * as React from "react";
import { useDrop } from './useDrop';

import {
  ItemConfig,
  OnSelect,
  OnRemove,
  UseCombobox
} from "./types";

export function useCombobox({
  items,
  multiple = false,
  onSelect,
  onRemove,
  ...options
}: {
  items: ItemConfig[];
  multiple: boolean;
  onSelect?: OnSelect;
  onRemove?: OnRemove;
}): UseCombobox {
  const [selected, selectedSet] = React.useState(
    items.filter((i) => i.selected)
  );

  const {
    isOpen,
    isOpenSet,
    items: results,
    getControlProps,
    getDropProps,
    ...rest
  } = useDrop({
    ...options,
    items,
    onSelect(item) {
      const isSelected = Boolean(
        selected.filter((i) => i.value === item.value)[0]
      );

      if (isSelected) {
        selectedSet(
          multiple ? selected.filter((i) => i.value !== item.value) : []
        );
        if (onRemove) onRemove(item);
      } else {
        selectedSet(multiple ? selected.concat(item) : [item]);
        if (onSelect) onSelect(item);
      }
    },
  });

  function getInputProps({ onBlur, ...props }: Partial<React.HTMLProps<HTMLElement>>) {
    const controlProps = getControlProps();

    return {
      ...controlProps,
      ...props,
      role: "combobox",
      onKeyUp(e: React.KeyboardEvent<HTMLInputElement>) {
        const input = e.target as HTMLInputElement;

        if (e.keyCode === 27) {
          input.blur();
          return;
        }
        if (e.keyCode === 13) return;
        if (input.value && Boolean(results.length) && !isOpen) {
          isOpenSet(true);
        }
      },
      onBlur(e: React.FocusEvent<HTMLElement>) {
        if (controlProps.onBlur) controlProps.onBlur(e); // delegate to drop handler
        if (onBlur) onBlur(e);
      },
      onClick() {}, // override
    };
  }

  return {
    ...rest,
    isOpen,
    isOpenSet,
    items: results.map((result) => {
      return {
        ...result,
        selected: Boolean(selected.filter((i) => i.value === result.value)[0]),
      };
    }),
    getInputProps,
    getDropProps(props: Partial<React.HTMLProps<HTMLElement>>) {
      return {
        ...getDropProps(props),
        role: "listbox",
      };
    },
    clear() {
      selectedSet([]);
    },
  };
}