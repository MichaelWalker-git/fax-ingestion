import AdjustIcon from "@mui/icons-material/Adjust";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import * as React from "react";

export const getStepIcon = (activeStep: number, index: number): React.ElementType=> {
    switch(true) {
        case activeStep === index:
            return AdjustIcon;
        case activeStep < index:
            return PanoramaFishEyeIcon;
        default:
            return CheckCircleIcon;
    }
}
