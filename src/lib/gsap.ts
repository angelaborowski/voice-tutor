import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Draggable } from "gsap/Draggable";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, CustomEase, Draggable, ScrambleTextPlugin, SplitText);

export { CustomEase, Draggable, SplitText, gsap, useGSAP };
