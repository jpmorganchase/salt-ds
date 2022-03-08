/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { JSONByScope, JSONObj } from "../helpers/parseToJson";

const lightAndDarkJSON: JSONObj = JSON.parse(
  `{"uitk": {"white": {"value": "rgb(255, 255, 255)"},"black": {"value": "rgb(0, 0, 0)"},"red": {"10": {"value": "rgb(255, 227, 224)"},"20": {"value": "rgb(255, 207, 201)"},"30": {"value": "rgb(255, 187, 178)"},"40": {"value": "rgb(255, 167, 156)"},"50": {"value": "rgb(255, 148, 133)"},"100": {"value": "rgb(255, 128, 111)"},"200": {"value": "rgb(255, 108, 88)"},"300": {"value": "rgb(255, 89, 66)"},"400": {"value": "rgb(237, 65, 42)"},"500": {"value": "rgb(227, 43, 22)"},"600": {"value": "rgb(196, 32, 16)"},"700": {"value": "rgb(166, 21, 11)"},"800": {"value": "rgb(136, 10, 5)"},"900": {"value": "rgb(106, 0, 0)"},"1000": {"value": "rgb(65, 37, 34)"}},"orange": {"10": {"value": "rgb(255, 232, 191)"},"20": {"value": "rgb(254, 223, 166)"},"30": {"value": "rgb(254, 214, 142)"},"40": {"value": "rgb(254, 205, 118)"},"50": {"value": "rgb(254, 197, 94)"},"100": {"value": "rgb(250, 181, 81)"},"200": {"value": "rgb(246, 165, 68)"},"300": {"value": "rgb(242, 149, 56)"},"400": {"value": "rgb(238, 133, 43)"},"500": {"value": "rgb(234, 115, 25)"},"600": {"value": "rgb(224, 101, 25)"},"700": {"value": "rgb(214, 85, 19)"},"800": {"value": "rgb(204, 68, 13)"},"900": {"value": "rgb(194, 52, 7)"},"1000": {"value": "rgb(54, 44, 36)"}},"green": {"10": {"value": "rgb(209, 244, 201)"},"20": {"value": "rgb(184, 232, 182)"},"30": {"value": "rgb(160, 221, 164)"},"40": {"value": "rgb(136, 210, 145)"},"50": {"value": "rgb(112, 199, 127)"},"100": {"value": "rgb(93, 189, 116)"},"200": {"value": "rgb(77, 180, 105)"},"300": {"value": "rgb(60, 171, 96)"},"400": {"value": "rgb(48, 156, 90)"},"500": {"value": "rgb(36, 135, 75)"},"600": {"value": "rgb(24, 114, 61)"},"700": {"value": "rgb(12, 93, 46)"},"800": {"value": "rgb(1, 73, 32)"},"900": {"value": "rgb(0, 57, 18)"},"1000": {"value": "rgb(35, 52, 43)"}},"teal": {"10": {"value": "rgb(218, 240, 240)"},"20": {"value": "rgb(199, 232, 232)"},"30": {"value": "rgb(180, 224, 225)"},"40": {"value": "rgb(162, 217, 218)"},"50": {"value": "rgb(141, 205, 209)"},"100": {"value": "rgb(123, 193, 200)"},"200": {"value": "rgb(99, 181, 192)"},"300": {"value": "rgb(73, 160, 172)"},"400": {"value": "rgb(48, 149, 166)"},"500": {"value": "rgb(0, 130, 151)"},"600": {"value": "rgb(27, 107, 133)"},"700": {"value": "rgb(0, 85, 113)"},"800": {"value": "rgb(1, 65, 86)"},"900": {"value": "rgb(0, 49, 76)"},"1000": {"value": "rgb(28, 55, 60)"}},"blue": {"10": {"value": "rgb(203, 231, 249)"},"20": {"value": "rgb(183, 222, 246)"},"30": {"value": "rgb(164, 213, 244)"},"40": {"value": "rgb(144, 204, 242)"},"50": {"value": "rgb(125, 195, 240)"},"100": {"value": "rgb(100, 177, 228)"},"200": {"value": "rgb(75, 159, 216)"},"300": {"value": "rgb(51, 141, 205)"},"400": {"value": "rgb(45, 129, 189)"},"500": {"value": "rgb(38, 112, 169)"},"600": {"value": "rgb(21, 92, 147)"},"700": {"value": "rgb(0, 71, 123)"},"800": {"value": "rgb(12, 53, 102)"},"900": {"value": "rgb(0, 40, 88)"},"1000": {"value": "rgb(35, 47, 56)"}},"purple": {"10": {"value": "rgb(249, 224, 247)"},"20": {"value": "rgb(247, 212, 244)"},"30": {"value": "rgb(245, 201, 241)"},"40": {"value": "rgb(243, 189, 238)"},"50": {"value": "rgb(241, 178, 235)"},"100": {"value": "rgb(223, 156, 225)"},"200": {"value": "rgb(205, 135, 215)"},"300": {"value": "rgb(192, 116, 203)"},"400": {"value": "rgb(169, 97, 181)"},"500": {"value": "rgb(150, 78, 162)"},"600": {"value": "rgb(129, 60, 141)"},"700": {"value": "rgb(103, 46, 122)"},"800": {"value": "rgb(83, 37, 109)"},"900": {"value": "rgb(59, 16, 84)"},"1000": {"value": "rgb(58, 45, 62)"}},"grey": {"10": {"value": "rgb(242, 244, 246)"},"20": {"value": "rgb(234, 237, 239)"},"30": {"value": "rgb(224, 228, 233)"},"40": {"value": "rgb(217, 221, 227)"},"50": {"value": "rgb(206, 210, 217)"},"60": {"value": "rgb(197, 201, 208)"},"70": {"value": "rgb(180, 183, 190)"},"80": {"value": "rgb(159, 163, 170)"},"90": {"value": "rgb(132, 135, 142)"},"100": {"value": "rgb(116, 119, 127)"},"200": {"value": "rgb(97, 101, 110)"},"300": {"value": "rgb(76, 80, 91)"},"400": {"value": "rgb(68, 72, 79)"},"500": {"value": "rgb(59, 63, 70)"},"600": {"value": "rgb(47, 49, 54)"},"700": {"value": "rgb(42, 44, 47)"},"800": {"value": "rgb(36, 37, 38)"},"900": {"value": "rgb(22, 22, 22)"}},"actionable": {"font": {"weight": {"value": "uitk-typography-weight-bold"}},"letter": {"spacing": {"value": "0.6px"}},"text": {"transform": {"value": "uppercase"},"align": {"value": "center"}},"cursor": {"hover": {"value": "pointer"},"active": {"value": "pointer"}},"border": {"radius": {"value": "0"}}},"container": {"cursor": {"hover": {"value": "pointer"},"active": {"value": "pointer"}},"border": {"width": {"value": "1px"},"style": {"value": "solid"},"radius": {"value": "0"}}},"disabled": {"cursor": {"value": "not-allowed"},"text": {"opacity": {"value": "0.7"}},"border": {"opacity": {"value": "0.4"}},"background": {"opacity": {"value": "0.4"}},"graphical": {"opacity": {"value": "0.4"}}},"editable": {"cursor": {"hover": {"value": "text"},"active": {"value": "text"}},"border": {"size": {"active": {"value": "2px"},"hover": {"value": "1px"},"regular": {"value": "1px"}}}},"focused": {"low": {"emphasis": {"border": {"width": {"value": "2px"},"style": {"value": "solid"}}}},"med": {"emphasis": {"outline": {"width": {"value": "2px"},"style": {"value": "dotted"},"offset": {"value": "0"},"top": {"value": "-1px"},"right": {"value": "0px"},"bottom": {"value": "-1px"},"left": {"value": "0px"}}}}},"navigable": {"link": {"text": {"decoration": {"value": "underline"}}}},"overlayable": {"layout": {"box": {"shadow": {"value": "uitk-shadow-black-2"}}},"interaction": {"box": {"shadow": {"value": "uitk-shadow-black-4"}}},"feedback": {"box": {"shadow": {"value": "uitk-shadow-black-6"}}}},"progress": {"small": {"font": {"size": {"value": "uitk-typography-size-40"}}},"medium": {"font": {"size": {"value": "uitk-typography-size-60"}}},"large": {"font": {"size": {"value": "uitk-typography-size-70"}}},"color": {"active": {"value": "linear-gradient(0deg, *uitk-progress-color-active-start* 0%, *uitk-progress-color-active-stop* 100%)"}, "value": "uitk-text-primary-color"}},"selectable": {"default": {"text": {"align": {"value": "left"}}},"background": {"active": {"value": "uitk-blue-500"}},"text": {"color": {"active": {"value": "uitk-white"}}}}},"font": {"family": {"value": "uitk-sans"}}}`
);
const lightJSON: JSONObj = JSON.parse(
  `{"uitk": {"shadow": {"flat": {"value": "none"},"black": {"1": {"value": "0 1px 3px 0 rgba(0, 0, 0, 0.1)"},"2": {"value": "0 2px 4px 0 rgba(0, 0, 0, 0.1)"},"3": {"value": "0 4px 8px 0 rgba(0, 0, 0, 0.15)"},"4": {"value": "0 6px 10px 0 rgba(0, 0, 0, 0.2)"},"5": {"value": "0 8px 16px 0 rgba(0, 0, 0, 0.2)"},"6": {"value": "0 12px 40px 5px rgba(0, 0, 0, 0.3)"}},"blue": {"1": {"value": "0 1px 3px 0 rgba(0, 40, 88, 0.35)"},"2": {"value": "0 2px 4px 0 rgba(0, 40, 88, 0.35)"},"3": {"value": "0 4px 8px 0 rgba(0, 40, 88, 0.45)"},"4": {"value": "0 6px 10px 0 rgba(0, 40, 88, 0.5)"},"5": {"value": "0 8px 16px 0 rgba(0, 40, 88, 0.5)"},"6": {"value": "0 12px 40px 5px rgba(0, 40, 88, 0.6)"}}},"actionable": {"primary": {"text": {"color": {"regular": {"value": "uitk-grey-900"},"hover": {"value": "uitk-grey-900"},"active": {"value": "uitk-white"},"disabled": {"value": "rgba(22, 22, 22, *uitk-disabled-text-opacity*)"}}},"background": {"regular": {"value": "uitk-grey-60"},"hover": {"value": "uitk-grey-40"},"active": {"value": "uitk-grey-200"},"disabled": {"value": "rgba(197, 201, 208, *uitk-disabled-graphical-opacity*)"}},"icon": {"color": {"active": {"value": "uitk-white"},"regular": {"value": "uitk-grey-900"},"hover": {"value": "uitk-grey-900"},"disabled": {"value": "rgba(22, 22, 22, *uitk-disabled-graphical-opacity*)"}}}},"cta": {"text": {"color": {"regular": {"value": "uitk-white"},"active": {"value": "uitk-white"},"hover": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-text-opacity*)"}}},"background": {"regular": {"value": "uitk-blue-600"},"hover": {"value": "uitk-blue-500"},"active": {"value": "uitk-blue-700"},"disabled": {"value": "rgba(21, 92, 147, *uitk-disabled-graphical-opacity*)"}},"icon": {"color": {"regular": {"value": "uitk-white"},"hover": {"value": "uitk-white"},"active": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-graphical-opacity*)"}}}},"secondary": {"text": {"color": {"regular": {"value": "uitk-grey-900"},"active": {"value": "uitk-white"},"hover": {"value": "uitk-grey-900"},"disabled": {"value": "rgba(22, 22, 22, *uitk-disabled-text-opacity*)"}}},"background": {"regular": {"value": "transparent"},"active": {"value": "uitk-grey-200"},"hover": {"value": "uitk-grey-40"}},"icon": {"color": {"active": {"value": "uitk-white"},"regular": {"value": "uitk-grey-300"},"hover": {"value": "uitk-grey-900"},"disabled": {"value": "rgba(22, 22, 22, *uitk-disabled-graphical-opacity*)"}}}}},"container": {"low": {"emphasis": {"background": {"regular": {"value": "uitk-white"},"hover": {"value": "uitk-white"},"active": {"value": "uitk-white"}},"border": {"color": {"regular": {"value": "uitk-grey-60"},"hover": {"value": "uitk-blue-500"},"active": {"value": "uitk-blue-500"},"disabled": {"value": "uitk-grey-60-fade-40"}}}}},"med": {"emphasis": {"background": {"regular": {"value": "uitk-grey-20"},"disabled": {"value": "uitk-grey-20-fade-40"}}}}},"editable": {"low": {"emphasis": {"background": {"value": "transparent"}}},"med": {"emphasis": {"background": {"value": "uitk-white"}}},"high": {"emphasis": {"background": {"value": "uitk-grey-20"}}},"text": {"primary": {"value": "uitk-grey-900"},"secondary": {"value": "uitk-grey-200"}},"icon": {"color": {"regular": {"value": "uitk-grey-600"},"hover": {"value": "uitk-grey-600"},"active": {"value": "uitk-grey-600"}}},"border": {"color": {"regular": {"value": "uitk-grey-90"},"hover": {"value": "uitk-blue-400"},"active": {"value": "uitk-blue-500"},"readonly": {"value": "uitk-grey-90-fade-20"}}},"selection": {"background": {"value": "uitk-blue-30-fade-99"}}},"focused": {"low": {"emphasis": {"color": {"regular": {"value": "uitk-blue-500"},"warning": {"value": "uitk-orange-700"},"error": {"value": "uitk-red-500"}}}},"med": {"emphasis": {"outline": {"color": {"regular": {"value": "uitk-blue-500"},"warning": {"value": "uitk-orange-700"},"error": {"value": "uitk-red-500"}},"regular": {"value": "*uitk-focused-color* *uitk-focused-line-style-outline* *uitk-focused-line-width* "},"warning": {"value": "*uitk-focused-color-warning* *uitk-focused-line-style-outline* *uitk-focused-line-width* "},"error": {"value": "*uitk-focused-color-error* *uitk-focused-line-style-outline* *uitk-focused-line-width* "}}}}},"icon": {"primary": {"color": {"regular": {"value": "uitk-grey-200"},"disabled": {"value": "rgba(97, 101, 110, *uitk-disabled-graphical-opacity*)"}}}},"navigable": {"link": {"color": {"regular": {"value": "uitk-grey-900"},"hover": {"value": "uitk-blue-500"},"active": {"value": "uitk-blue-500"},"disabled": {"value": "uitk-grey-900"}}}},"overlayable": {"feedback": {"scrim": {"primary": {"background": {"value": "rgba(0, 0, 0, 0.8)"}},"secondary": {"background": {"value": "rgba(255, 255, 255, 0.8)"}}}}},"progress": {"track": {"color": {"value": "uitk-grey-90"}},"color": {"active": {"start": {"value": "uitk-teal-500"},"stop": {"value": "uitk-blue-500"}}}},"selectable": {"text": {"color": {"regular": {"value": "uitk-grey-900"}}},"background": {"regular": {"value": "uitk-white"},"hover": {"value": "uitk-blue-30"},"blur": {"active": {"value": "uitk-grey-30"}}}},"separable": {"section": {"color": {"value": "uitk-grey-60"}},"item": {"color": {"value": "uitk-grey-40"}},"subtle": {"color": {"value": "uitk-grey-20"}}},"status": {"info": {"color": {"value": "uitk-blue-500"},"med": {"emphasis": {"background": {"value": "uitk-blue-10"}}}},"success": {"color": {"value": "uitk-green-500"},"med": {"emphasis": {"background": {"value": "uitk-green-10"}}}},"warning": {"color": {"value": "uitk-orange-700"},"med": {"emphasis": {"background": {"value": "uitk-orange-10"}}}},"error": {"color": {"value": "uitk-red-500"},"med": {"emphasis": {"background": {"value": "uitk-red-10"}}}},"low": {"emphasis": {"background": {"value": "uitk-white"}}}},"text": {"primary": {"color": {"regular": {"value": "uitk-grey-900"},"disabled": {"value": "rgba(22, 22, 22, *uitk-disabled-text-opacity*)"}}},"secondary": {"color": {"regular": {"value": "uitk-grey-200"},"disabled": {"value": "rgba(97, 101, 110, *uitk-disabled-text-opacity*)"}}},"growth": {"indicator": {"up": {"color": {"value": "uitk-green-500"}},"down": {"color": {"value": "uitk-red-500"}}}}}}}`
);
const darkJSON: JSONObj = JSON.parse(
  `{"uitk": {"shadow": {"flat": {"value": "none"},"black": {"1": {"value": "0 1px 3px 0 rgba(0, 0, 0, 0.5)"},"2": {"value": "0 2px 4px 0 rgba(0, 0, 0, 0.5)"},"3": {"value": "0 4px 8px 0 rgba(0, 0, 0, 0.55)"},"4": {"value": "0 6px 10px 0 rgba(0, 0, 0, 0.55)"},"5": {"value": "0 8px 16px 0 rgba(0, 0, 0, 0.6)"},"6": {"value": "0 12px 40px 5px rgba(0, 0, 0, 0.65)"}},"blue": {"1": {"value": "0 1px 3px 0 rgba(0, 18, 40, 1)"},"2": {"value": "0 2px 4px 0 rgba(0, 18, 40, 1)"},"3": {"value": "0 4px 8px 0 rgba(0, 18, 40, 1)"},"4": {"value": "0 6px 10px 0 rgba(0, 18, 40, 1)"},"5": {"value": "0 8px 16px 0 rgba(0, 18, 40, 1)"},"6": {"value": "0 12px 40px 5px rgba(0, 18, 40, 1)"}}},"actionable": {"primary": {"text": {"color": {"regular": {"value": "uitk-white"},"active": {"value": "uitk-grey-900"},"hover": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-text-opacity*)"}}},"background": {"regular": {"value": "uitk-grey-300"},"active": {"value": "uitk-grey-80"},"hover": {"value": "uitk-grey-200"},"disabled": {"value": "rgba(76, 80, 91, *uitk-disabled-graphical-opacity*)"}},"icon": {"color": {"regular": {"value": "uitk-white"},"active": {"value": "uitk-grey-900"},"hover": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-graphical-opacity*)"}}}},"cta": {"text": {"color": {"regular": {"value": "uitk-white"},"active": {"value": "uitk-white"},"hover": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-text-opacity*)"}}},"background": {"regular": {"value": "uitk-blue-600"},"active": {"value": "uitk-blue-700"},"hover": {"value": "uitk-blue-500"},"disabled": {"value": "rgba(21, 92, 147, *uitk-disabled-graphical-opacity*)"}},"icon": {"color": {"regular": {"value": "uitk-white"},"active": {"value": "uitk-white"},"hover": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-graphical-opacity*)"}}}},"secondary": {"text": {"color": {"regular": {"value": "uitk-white"},"active": {"value": "uitk-grey-900"},"hover": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-text-opacity*)"}}},"background": {"regular": {"value": "transparent"},"hover": {"value": "uitk-grey-200"},"active": {"value": "uitk-grey-80"}},"icon": {"color": {"regular": {"value": "uitk-grey-60"},"active": {"value": "uitk-grey-900"},"hover": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-graphical-opacity*)"}}}}},"container": {"low": {"emphasis": {"background": {"regular": {"value": "uitk-grey-800"},"hover": {"value": "uitk-grey-800"},"active": {"value": "uitk-grey-800"}},"border": {"color": {"regular": {"value": "uitk-grey-400"},"hover": {"value": "uitk-blue-400"},"active": {"value": "uitk-blue-400"},"disabled": {"value": "uitk-grey-400-fade-40"}}}}},"med": {"emphasis": {"background": {"regular": {"value": "uitk-grey-600"},"disabled": {"value": "uitk-grey-600-fade-40"}}}}},"editable": {"low": {"emphasis": {"background": {"value": "transparent"}}},"med": {"emphasis": {"background": {"value": "uitk-grey-800"}}},"high": {"emphasis": {"background": {"value": "uitk-grey-900"}}},"text": {"primary": {"value": "uitk-white"},"secondary": {"value": "uitk-grey-70"}},"icon": {"color": {"regular": {"value": "uitk-grey-60"},"hover": {"value": "uitk-grey-60"},"active": {"value": "uitk-grey-60"}}},"border": {"color": {"regular": {"value": "uitk-grey-100"},"hover": {"value": "uitk-blue-300"},"active": {"value": "uitk-blue-400"},"readonly": {"value": "uitk-grey-100-fade-20"}}},"selection": {"background": {"value": "uitk-blue-700-fade-99"}}},"focused": {"low": {"emphasis": {"border": {"color": {"regular": {"value": "uitk-blue-400"},"warning": {"value": "uitk-orange-500"},"error": {"value": "uitk-red-400"}}}}},"med": {"emphasis": {"outline": {"color": {"regular": {"value": "uitk-blue-400"},"warning": {"value": "uitk-orange-500"},"error": {"value": "uitk-red-400"}},"regular": {"value": "*uitk-focused-color* *uitk-focused-line-style-outline* *uitk-focused-line-width* "},"warning": {"value": "*uitk-focused-color-warning* *uitk-focused-line-style-outline* *uitk-focused-line-width* "},"error": {"value": "*uitk-focused-color-error* *uitk-focused-line-style-outline* *uitk-focused-line-width* "}}}}},"icon": {"primary": {"color": {"regular": {"value": "uitk-grey-60"},"disabled": {"value": "rgba(197, 201, 208, *uitk-disabled-graphical-opacity*)"}}}},"navigable": {"link": {"color": {"regular": {"value": "uitk-white"},"hover": {"value": "uitk-blue-200"},"active": {"value": "uitk-blue-200"},"disabled": {"value": "uitk-white"}}}},"overlayable": {"feedback": {"scrim": {"primary": {"background": {"value": "rgba(0, 0, 0, 0.7)"}},"secondary": {"background": {"value": "rgba(36, 37, 38, 0.8)"}}}}},"progress": {"track": {"color": {"value": "uitk-grey-100"}},"color": {"active": {"start": {"value": "uitk-teal-300"},"stop": {"value": "uitk-blue-300"}}}},"selectable": {"text": {"color": {"regular": {"value": "uitk-white"}}},"background": {"regular": {"value": "uitk-grey-800"},"hover": {"value": "uitk-blue-30"},"blur": {"active": {"value": "uitk-grey-500"}}}},"separable": {"section": {"color": {"value": "uitk-grey-400"}},"item": {"color": {"value": "uitk-grey-500"}},"subtle": {"color": {"value": "uitk-grey-600"}}},"status": {"info": {"color": {"value": "uitk-blue-400"},"med": {"emphasis": {"background": {"value": "uitk-blue-1000"}}}},"success": {"color": {"value": "uitk-green-400"},"med": {"emphasis": {"background": {"value": "uitk-green-1000"}}}},"warning": {"color": {"value": "uitk-orange-500"},"med": {"emphasis": {"background": {"value": "uitk-orange-1000"}}}},"error": {"color": {"value": "uitk-red-400"},"med": {"emphasis": {"background": {"value": "uitk-red-1000"}}}},"low": {"emphasis": {"background": {"value": "uitk-grey-800"}}}},"text": {"primary": {"color": {"regular": {"value": "uitk-white"},"disabled": {"value": "rgba(255, 255, 255, *uitk-disabled-text-opacity*)"}}},"secondary": {"color": {"regular": {"value": "uitk-grey-70"},"disabled": {"value": "rgba(180, 183, 190, *uitk-disabled-text-opacity*)"}}},"growth": {"indicator": {"up": {"color": {"value": "uitk-green-400"}},"down": {"color": {"value": "uitk-red-400"}}}}}}}`
);
const densityAllJSON: JSONObj = JSON.parse(
  `{"uitk": {"size": {"basis": {"unit": {"value": "4px"}},"icon": {"small": {"value": "12px"},"medium": {"value": "24px"},"large": {"value": "48px"}},"regular": {"high": {"value": "20px"},"medium": {"value": "28px"},"low": {"value": "36px"},"touch": {"value": "44px"}},"stackable": {"high": {"value": "24px"},"medium": {"value": "36px"},"low": {"value": "48px"},"touch": {"value": "60px"}}},"spacing": {"touch": {"value": "16px"},"low": {"value": "12px"},"medium": {"value": "8px"},"high": {"value": "4px"}},"typography": {"font": {"family": {"value": "uitk-sans"}},"size": {"10": {"value": "8px"},"30": {"value": "10px"},"40": {"value": "11px"},"50": {"value": "12px"},"60": {"value": "14px"},"70": {"value": "16px"},"80": {"value": "18px"},"90": {"value": "20px"},"100": {"value": "22px"},"110": {"value": "24px"},"120": {"value": "26px"},"130": {"value": "30px"},"150": {"value": "36px"},"180": {"value": "44px"},"210": {"value": "56px"},"240": {"value": "64px"},"regular": {"touch": {"value": "uitk-typography-size-70"},"low": {"value": "uitk-typography-size-60"},"medium": {"value": "uitk-typography-size-50"},"high": {"value": "uitk-typography-size-40"}},"caption": {"touch": {"value": "uitk-typography-size-50"},"low": {"value": "uitk-typography-size-40"},"medium": {"value": "uitk-typography-size-40"},"high": {"value": "uitk-typography-size-30"}}},"line": {"height": {"value": "1.3"}},"weight": {"light": {"value": "200"},"regular": {"value": "400"},"semiBold": {"value": "600"},"bold": {"value": "700"},"extraBold": {"value": "800"}}},"zindex": {"tooltip": {"value": "1500"},"snackbar": {"value": "1400"},"modal": {"value": "1300"},"drawer": {"value": "1200"},"appbar": {"value": "1100"}}}}`
);
const densityTouchJSON: JSONObj = JSON.parse(
  `{"uitk": {"size": {"regular": {"unit": {"value": "uitk-size-regular-touch"}},"stackable": {"unit": {"value": "uitk-size-stackable-touch"}}},"spacing": {"unit": {"value": "uitk-spacing-touch"}},"typography": {"size": {"regular": {"unit": {"value": "uitk-typography-size-regular-touch"}},"caption": {"unit": {"value": "uitk-typography-size-caption-touch"}}}}}}`
);
const densityLowJSON: JSONObj = JSON.parse(
  `{"uitk": {"size": {"regular": {"unit": {"value": "uitk-size-regular-low"}},"stackable": {"unit": {"value": "uitk-size-stackable-low"}}},"spacing": {"unit": {"value": "uitk-spacing-low"}},"typography": {"size": {"regular": {"unit": {"value": "uitk-typography-size-regular-low"}},"caption": {"unit": {"value": "uitk-typography-size-caption-low"}}}}}}`
);
const densityMediumJSON: JSONObj = JSON.parse(
  `{"uitk": {"size": {"regular": {"unit": {"value": "uitk-size-regular-medium"}},"stackable": {"unit": {"value": "uitk-size-stackable-medium"}}},"spacing": {"unit": {"value": "uitk-spacing-medium"}},"typography": {"size": {"regular": {"unit": {"value": "uitk-typography-size-regular-medium"}},"caption": {"unit": {"value": "uitk-typography-size-caption-medium"}}}}}}`
);
const densityHighJSON: JSONObj = JSON.parse(
  `{"uitk": {"size": {"regular": {"unit": {"value": "uitk-size-regular-high"}},"stackable": {"unit": {"value": "uitk-size-stackable-high"}}},"spacing": {"unit": {"value": "uitk-spacing-high"}},"typography": {"size": {"regular": {"unit": {"value": "uitk-typography-size-regular-high"}},"caption": {"unit": {"value": "uitk-typography-size-caption-high"}}}}}}`
);

export const uitkTheme: JSONByScope[] = [
  { scope: "mode-all", jsonObj: lightAndDarkJSON },
  { scope: "light", jsonObj: lightJSON },
  { scope: "dark", jsonObj: darkJSON },
  { scope: "density-all", jsonObj: densityAllJSON },
  { scope: "density-touch", jsonObj: densityTouchJSON },
  { scope: "density-low", jsonObj: densityLowJSON },
  { scope: "density-medium", jsonObj: densityMediumJSON },
  { scope: "density-high", jsonObj: densityHighJSON },
];
