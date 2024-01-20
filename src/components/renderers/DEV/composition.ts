import merge from 'lodash/merge';
import { computed, inject, provide, type ComputedRef } from 'vue';
import type {JsonFormsSubStates, JsonSchema, UISchemaElement} from '@jsonforms/core';
import type Ajv from 'ajv';
import {defaultStyles as JfDefaultStyles, Styles} from "@jsonforms/vue-vanilla";
import {composePaths, Resolve, getFirstPrimitiveProp, computeLabel} from "@jsonforms/core";
export interface NestedInfo {
  level: number;
  parentElement?: 'array' | 'object';
}

export const useComputedLabel = <I extends { control: any }>(
    input: I,
    appliedOptions: ComputedRef<any>
) => {
  return computed((): string => {
    return computeLabel(
        input.control.value.label,
        input.control.value.required,
        !!appliedOptions.value?.hideRequiredAsterisk
    );
  });
};

export const reuseAjvForSchema = (ajv: Ajv, schema: JsonSchema): Ajv => {
  if (
      Object.prototype.hasOwnProperty.call(schema, 'id') ||
      Object.prototype.hasOwnProperty.call(schema, '$id')
  ) {
    ajv.removeSchema(schema);
  }
  return ajv;
};

export const useControlAppliedOptions = <I extends { control: any }>(
  input: I
) => {
  return computed(() =>
    merge(
      {},
      JSON.parse(JSON.stringify(input.control.value.config)), //deepmerge
      JSON.parse(JSON.stringify(input.control.value.uischema?.options ?? [])) //deepmerge
    )
  );
};


export const useNested = (element: false | 'array' | 'object'): NestedInfo => {
  const nestedInfo = inject<NestedInfo>('jsonforms.nestedInfo', { level: 0 });
  if (element) {
    provide('jsonforms.nestedInfo', {
      level: nestedInfo.level + 1,
      parentElement: element,
    });
  }
  return nestedInfo;
};


export const useAjv = () => {
  const jsonforms = inject<JsonFormsSubStates>('jsonforms');

  if (!jsonforms) {
    throw new Error(
        "'jsonforms' couldn't be injected. Are you within JSON Forms?"
    );
  }

  // should always exist
  return jsonforms.core?.ajv as Ajv;
};

export const useTranslator = () => {
  const jsonforms = inject<JsonFormsSubStates>('jsonforms');

  if (!jsonforms) {
    throw new Error(
        "'jsonforms couldn't be injected. Are you within JSON Forms?"
    );
  }

  if (!jsonforms.i18n || !jsonforms.i18n.translate) {
    throw new Error(
        "'jsonforms i18n couldn't be injected. Are you within JSON Forms?"
    );
  }

  const translate = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return jsonforms.i18n!.translate!;
  });

  return translate;
};
export const i18nDefaultMessages = {
  arraylayout: {
    add: 'Add',
    delete: 'Delete',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    dialogTitle: 'Delete {{ element }}?',
    dialogText: 'The element will be deleted.',
    dialogConfirm: 'Delete',
    dialogCancel: 'Cancel',
  },
};


/**
 * Adds styles, appliedOptions and childUiSchema
 */
export const useBoPlusArrayControl = <I extends { control: any }>(input: I) => {
  const appliedOptions = useControlAppliedOptions(input);

  const computedLabel = useComputedLabel(input, appliedOptions);

  const childLabelForIndex = (index: number | null) =>
      childLabelForIndexWithInput(input, index);

  return {
    ...input,
    styles: useStyles(input.control.value.uischema),
    appliedOptions,
    childLabelForIndex,
    computedLabel,
  };
};

export const childLabelForIndexWithInput = (input: any, index: number | null) => {
  if (index === null) {
    return '';
  }
  const childLabelProp =
      input.control.value.uischema.options?.childLabelProp ??
      getFirstPrimitiveProp(input.control.value.schema);

  if (!childLabelProp) {
    return `${index}`;
  }
  const labelValue = Resolve.data(
      input.control.value.data,
      composePaths(`${index}`, childLabelProp)
  );
  if (
      labelValue === undefined ||
      labelValue === null ||
      Number.isNaN(labelValue)
  ) {
    return '';
  }
  return `${labelValue}`;
};

const createEmptyStyles = (): Styles|any => ({
  control: {},
  verticalLayout: {},
  horizontalLayout: {},
  group: {},
  arrayList: {},
  label: {},
  categorization: {},
});

export const useStyles = (element?: UISchemaElement, moreStyles?:Styles): Styles => {
  const userStyles = inject('styles', JfDefaultStyles);
  if (!element?.options?.styles) {
    return userStyles;
  }
  const styles = createEmptyStyles();
  if (userStyles) {
    merge(styles, userStyles);
  } else {
    merge(styles, JfDefaultStyles);
  }
  if (element?.options?.styles) {
    merge(styles, element.options.styles);
  }

  moreStyles && merge(styles, moreStyles);

  return styles;
};


export const defaultStyles: BopStyles|any = {
  categorization: {
    root: 'categorization',
    category: 'tabs',
    selected: 'selected',
    panel: 'panel',
  },
  allOf: {
    root: 'allof',
  },
  oneOf: {
    root: 'oneof',
    select: 'oneof-select',
  },
  anyOf: {
    root: 'categorization',
    category: 'tabs',
    selected: 'selected',
    panel: 'panel',
  },
  objectAddProps: {
    root: 'object-addprops-root',
    toolbar: 'object-addprops-toolbar',
    items: 'object-addprops-items',
  },
  enumArray: {
    root: 'enum-array',
    item: 'enum-array-item',
  },
  toggle: {
    root: 'toggle',
    slider: 'slider',
  },
};

export interface BopStyles extends Styles {
  categorization: {
    root?: string;
    category?: string;
    selected?: string;
    panel?: string;
  };
  oneOf: {
    root?: string;
    select?: string;
  };
  allOf: {
    root?: string;
  };
  anyOf: {
    root?: string;
    category?: string;
    selected?: string;
    panel?: string;
  };
  objectAddProps: {
    root?: string;
    toolbar?: string;
    items?: string;
  };
  enumArray: {
    root?: string;
    item?: string;
    label?: string;
  };
  toggle: {
    root?: string;
    slider?: string;
  };
}
