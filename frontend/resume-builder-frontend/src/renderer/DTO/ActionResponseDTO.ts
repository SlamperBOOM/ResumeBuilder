import FrontendActionEnum from '../frontendAction/FrontendActionEnum';

type ActionResponseDTO = {
  frontend_action: FrontendActionEnum;
  payload?: JSON;
};

export default ActionResponseDTO;
