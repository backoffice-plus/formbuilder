<template>

  <div  :class="styles.objectAddProps.root" v-if="control.visible">

    <header :class="styles.objectAddProps.toolbar">
      <label>{{ additionalPropertiesTitle }}</label>

      <div>
        <input
            :required="true"
            type="text"
            v-model="newPropertyName"
            :placeholder="placeholder"
            :disabled="!control.enabled"
        >
        <div :class="styles.control.error" v-if="newPropertyErrors.length">
          {{ newPropertyErrors ? newPropertyErrors : null }}
        </div>
      </div>

      <div>
        <button
            @click="addProperty"
            :disabled="addPropertyDisabled"
            v-text="'+'"
        />
      </div>

    </header>

    <section
        :class="styles.objectAddProps.items"
    >

      <div
          v-for="(element, index) in additionalPropertyItems"
          :key="`${index}`"
      >
        <dispatch-renderer
            v-if="element.schema && element.uischema"
            :schema="element.schema"
            :uischema="element.uischema"
            :path="element.path"
            :enabled="control.enabled"
            :renderers="control.renderers"
            :cells="control.cells"
        />

        <button
            :disabled="removePropertyDisabled"
            @click="removeProperty(element.propertyName)"
            v-if="control.enabled"
            v-text="'x'"
        />
      </div>
    </section>
  </div>

</template>


<script setup lang="ts">
import type {Ref} from 'vue';
import {computed, onBeforeMount, PropType, ref, watch} from 'vue';
import type {GroupLayout, JsonSchema, JsonSchema7, UISchemaElement} from '@jsonforms/core';
import {
  composePaths,
  createAjv,
  createControlElement,
  createDefaultValue,
  encode,
  Generate,
  getI18nKey, validate
} from '@jsonforms/core';
import {DispatchRenderer, useJsonFormsControlWithDetail} from '@jsonforms/vue';
import Ajv, { ValidateFunction } from 'ajv';
import {startCase} from "lodash";
import {useStyles} from "@jsonforms/vue-vanilla";
import merge from "lodash/merge";
import {defaultStyles} from "../utils/composition";

/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/components/AdditionalProperties.vue
 */

type Input = ReturnType<typeof useJsonFormsControlWithDetail>;
interface AdditionalPropertyType {
  propertyName: string;
  path: string;
  schema: JsonSchema | undefined;
  uischema: UISchemaElement | undefined;
}

const props = defineProps({
  input: {
    type: Object as PropType<Input>,
    required: true,
  },
});
const control = props.input.control as any as Ref<typeof props.input.control>;



//
// init
//
//const t = getTranslator();

/** @ts-ignore */
const appliedOptions = computed(() => props.input.appliedOptions.value);

const reservedPropertyNames = Object.keys(control.value.schema.properties || {});
const additionalKeys = Object.keys(control.value?.data ?? {}).filter((k) => !reservedPropertyNames.includes(k));

const newPropertyName = ref<string | null>('');
const additionalPropertyItems = ref<AdditionalPropertyType[]>([]);

const styles = merge(useStyles(control.value.uischema), defaultStyles);

let propertyNameSchema: JsonSchema7 | undefined = undefined;
let propertyNameValidator: ValidateFunction<unknown> | undefined = undefined;


onBeforeMount(() => {


  additionalKeys.forEach((propName) => {
    const additionalProperty = toAdditionalPropertyType(propName,  control.value.data[propName]);
    additionalPropertyItems.value.push(additionalProperty);
  });


  // TODO: create issue against jsonforms to add propertyNames into the JsonSchema interface
  // propertyNames exist in draft-6 but not defined in the JsonSchema
  if (typeof (control.value.schema as any).propertyNames === 'object') {
    propertyNameSchema = (control.value.schema as any).propertyNames;
  }

  if (
      typeof control.value.schema.additionalProperties !== 'object' &&
      typeof control.value.schema.patternProperties === 'object'
  ) {
    const matchPatternPropertiesKeys: JsonSchema7 = {
      type: 'string',
      pattern: Object.keys(control.value.schema.patternProperties).join('|'),
    };
    propertyNameSchema = propertyNameSchema
        ? { allOf: [propertyNameSchema, matchPatternPropertiesKeys] }
        : matchPatternPropertiesKeys;
  }

  if (propertyNameSchema) {
    const ajv = createAjv();
    const reuseAjvForSchema = (ajv: Ajv, schema: JsonSchema): Ajv => {
      if (
          Object.prototype.hasOwnProperty.call(schema, 'id') ||
          Object.prototype.hasOwnProperty.call(schema, '$id')
      ) {
        ajv.removeSchema(schema);
      }
      return ajv;
    };

    propertyNameValidator = reuseAjvForSchema(ajv, propertyNameSchema).compile(propertyNameSchema);
  }
})



//
// computed
//

const placeholder = computed((): string => {
  return 'New Property';
  //:TODO translator
  //return this.t(this.i18nKey('newProperty.placeholder'), 'New Property');
});


const newPropertyErrors = computed(() => {
  if (newPropertyName.value) {
    const messages = propertyNameValidator
        ? (validate(propertyNameValidator, newPropertyName.value)
            .map((error) => error.message)
            .filter((message) => message) as string[])
        : [];
    if (
        reservedPropertyNames.includes(newPropertyName.value) ||
        additionalPropertyItems.value.find(ap => ap.propertyName === newPropertyName.value
        ) !== undefined
    ) {
      // already defined
      messages.push( `Property '${newPropertyName.value}' is already defined`);
    }
    // JSONForms has special means for "[]." chars - those are part of the path composition so for not we can't support those without special handling
    if (newPropertyName.value.includes('[')) {
      messages.push('Property name contains invalid char: [');
    }
    if (newPropertyName.value.includes(']')) {
      messages.push('Property name contains invalid char: ]');
    }
    if (newPropertyName.value.includes('.')) {
      messages.push('Property name contains invalid char: .');
    }
    return messages;
  }
  return [];
});

const removePropertyDisabled = computed((): boolean => {
  return (
      // add is disabled because the overall control is disabled
      !control.value.enabled ||
      // add is disabled because of contraints
      (appliedOptions.value.restrict && minPropertiesReached.value)
  );
});

const minPropertiesReached = computed((): boolean => {
  const minProperties = control.value.schema.minProperties;
  return (
      minProperties !== undefined && // we have minProperties constraint
      control.value.data && // we have data to check
      // the current number of properties in the object is less or equals to the minProperties
      Object.keys(control.value.data).length <= minProperties
  );
});
const maxPropertiesReached = computed((): boolean => {
  const maxProperties = control.value.schema.maxProperties;
  return (
      maxProperties !== undefined && // we have maxProperties constraint
      control.value.data && // we have data to check
      // the current number of properties in the object is greater or equals to the maxProperties
      Object.keys(control.value.data).length >= maxProperties
  );
});


const addPropertyDisabled = computed((): boolean => {
  return (
      // add is disabled because the overall control is disabled
      !control.value.enabled ||
      // add is disabled because of contraints
      (appliedOptions.value.restrict && maxPropertiesReached.value) ||
      // add is disabled because there are errors for the new property name or it is not specified
      newPropertyErrors.value.length > 0 ||
      !newPropertyName
  );
});

const additionalPropertiesTitle = computed((): string | undefined => {
  const additionalProperties = control.value.schema.additionalProperties;
  const label =
      typeof additionalProperties === 'object' &&
      Object.prototype.hasOwnProperty.call(additionalProperties, 'title')
          ? additionalProperties.title ?? 'Additional Properties'
          : 'Additional Properties';

  //:TODO translator
  //return t(i18nKey('title'), label);
  return label;
});


//
// methods
//

const i18nKey = (key: string): string => {
  return getI18nKey(
      control.value.schema,
      control.value.uischema,
      control.value.path,
      `additionalProperties.${key}`
  );
};

const toAdditionalPropertyType = (propName: string, propValue: any): AdditionalPropertyType => {

  let propSchema: JsonSchema | undefined = undefined;
  let propUiSchema: UISchemaElement | undefined = undefined;

  if (control.value.schema.patternProperties) {
    const matchedPattern = Object.keys(control.value.schema.patternProperties).find((pattern) => new RegExp(pattern).test(propName));
    if (matchedPattern) {
      propSchema = control.value.schema.patternProperties[matchedPattern];
    }
  }
  if (!propSchema && typeof control.value.schema.additionalProperties === 'object') {
    propSchema = control.value.schema.additionalProperties;
  }

  if (!propSchema && propValue !== undefined) {
    // can't find the propertySchema so use the schema based on the value
    // this covers case where the data in invalid according to the schema
    propSchema = Generate.jsonSchema(
        {prop: propValue},
        {
          additionalProperties: false,
          required: () => false,
        }
    ).properties?.prop;
  }
  if (propSchema) {
    if (propSchema.type === 'object' || propSchema.type === 'array') {
      propUiSchema = Generate.uiSchema(propSchema, 'Group');
      (propUiSchema as GroupLayout).label = propSchema.title ?? startCase(propName);
    } else {
      propUiSchema = createControlElement(control.value.path + '/' + encode(propName) );
    }
  }

  return {
    propertyName: propName,
    path: composePaths(control.value.path, propName),
    schema: propSchema,
    uischema: propUiSchema,
  };
}

const addProperty = () => {
  if (newPropertyName.value) {
    const additionalProperty = toAdditionalPropertyType(newPropertyName.value,undefined);
    if (additionalProperty) {
      additionalPropertyItems.value.push(additionalProperty);
    }

    if (typeof control.value.data === 'object' && additionalProperty.schema) {
      control.value.data[newPropertyName.value] = createDefaultValue(additionalProperty.schema);
      // we need always to preserve the key even when the value is "empty"
      props.input.handleChange(control.value.path, control.value.data);
    }
  }
  newPropertyName.value = '';
};

const removeProperty = (propName: string): void => {
  additionalPropertyItems.value = additionalPropertyItems.value.filter(d => d.propertyName !== propName);

  if (typeof control.value.data === 'object') {
    delete control.value.data[propName];
    props.input.handleChange(control.value.path, control.value.data);
  }
};


//
//
//
watch(
    () => control.value.data,
    (newData) => {
      // revert back any undefined values back to the default value when the key is part of the addtional properties since we want to preserved the key
      // for example when we have a string additonal property then when we clear the text component the componet by default sets the value to undefined to remove the property from the object - for additional properties we do not want that behaviour
      if (typeof control.value.data === 'object') {
        const keys = Object.keys(newData);
        let hasChanges = false;
        additionalPropertyItems.value.forEach((ap) => {
          if (
              ap.schema &&
              (!keys.includes(ap.propertyName) ||
                  newData[ap.propertyName] === undefined ||
                  (newData[ap.propertyName] === null &&
                      ap.schema.type !== 'null')) // createDefaultValue will return null only when the ap.schema.type is 'null'
          ) {
            const newValue = createDefaultValue(ap.schema);
            hasChanges = newData[ap.propertyName] !== newValue;
            newData[ap.propertyName] = newValue;
          }
        });

        console.log("watch","hasChanges",hasChanges,control.value.path, newData)

        if (hasChanges) {
          props.input.handleChange(control.value.path, newData);
        }
      }
    },
    { deep: true }
);



</script>
