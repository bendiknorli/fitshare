import React from "react";

export function Member(props: { name: string }) {
  return <div className="Friend">
    <div className="Friend-profile-pic"></div>
    <div className="Friend-name">{props.name}</div>
  </div>;
}