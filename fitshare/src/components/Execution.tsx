import React, { useState } from "react";
import { GiWeightLiftingUp } from "react-icons/gi";

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    id: string;
    owner: string;
}

export function Execution(props: { name: string, onClick: () => void, selected: boolean }) {

    return <div className="Execution">
        <GiWeightLiftingUp className="Execution-pic" />
        <div className={props.selected ? "Option-selected" : "Option"} onClick={props.onClick}>{props.name}</div>
    </div>;
}