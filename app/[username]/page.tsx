"use client";
import Button from "../components/Button";

export default function Page(props) {
  const {
    params: { username },
  } = props;

  const join = () => {};
  console.log(props);
  return <Button onClick={join}>Join</Button>;
}
