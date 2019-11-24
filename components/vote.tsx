import React from "react";
import config from '../config'

const Vote = () => (
  <script
    src={config.voteUri}
    type="text/javascript"
  ></script>
)

export default Vote
