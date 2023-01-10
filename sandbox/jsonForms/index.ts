import exampleBasic from "./basic";
import exampleTabs from "./categorization_tabs";
import exampleTabsRules from "./categorization_tabs_withrules";
import {layoutHorizontal,layoutVertical,layoutNested,layoutGroup} from "./examples_layout";
import {layoutControl,layoutControlOptions} from "./examples_control";
import group from "./group";
import tabInTabs from "./tabs_in_tabs";
import rule from "./rule";

export default {
  group:group,
  tabInTabs:tabInTabs,
  rule:rule,
  basic:exampleBasic,
  tabs:exampleTabs,
  tabsRules:exampleTabsRules,

  ExampleLayoutHorizontal:layoutHorizontal,
  ExampleLayoutVertical:layoutVertical,
  ExampleLayoutNested:layoutNested,
  ExampleLayoutGroup:layoutGroup,
  ExampleControl:layoutControl,
  ExampleControlOptions:layoutControlOptions,
};
