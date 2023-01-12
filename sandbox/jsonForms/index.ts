import exampleBasic from "./basic";
import {layoutHorizontal,layoutVertical,layoutNested,layoutGroup} from "./examples_layout";
import {layoutControl,layoutControlOptions} from "./examples_control";
import {layoutCategorization,layoutCategorizationSimplified} from "./examples_categorization";
import {layoutEnum,layoutOneOf} from "./examples_multipleChoice";
import {exampleArray} from "./examples_array";
import group from "./group";
import tabInTabs from "./tabs_in_tabs";
import rule from "./rule";
import _default from "./default";
import {jsonForms as formBuilderControlOptions} from "../../src/schema/formBuilderControlOptions";

export default {
  default:_default,
  group:group,
  tabInTabs:tabInTabs,
  rule:rule,

  ExampleBasic:exampleBasic,
  ExampleLayoutHorizontal:layoutHorizontal,
  ExampleLayoutVertical:layoutVertical,
  ExampleLayoutNested:layoutNested,
  ExampleLayoutGroup:layoutGroup,
  ExampleControl:layoutControl,
  ExampleControlOptions:layoutControlOptions,
  ExampleCategorization:layoutCategorization,
  ExampleCategorizationSimplified:layoutCategorizationSimplified,
  ExampleArray:exampleArray,
  ExampleMultipleEnum:layoutEnum,
  ExampleMultipleOneOf:layoutOneOf,

  formBuilderControlOptions:formBuilderControlOptions
};
