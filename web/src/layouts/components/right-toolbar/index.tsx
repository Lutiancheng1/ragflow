import User from '../user';

import styled from './index.less';

const RightToolBar = () => {
  return (
    <div className={styled.toolbarWrapper}>
      <User></User>
    </div>
  );
};

export default RightToolBar;
