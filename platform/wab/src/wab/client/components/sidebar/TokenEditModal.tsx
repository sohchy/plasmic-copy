import { StyleToken } from "@/wab/classes";
import { StudioCtx } from "@/wab/client/studio-ctx/StudioCtx";
import { TokenType } from "@/wab/commons/StyleToken";
import { VariantedStylesHelper } from "@/wab/shared/VariantedStylesHelper";
import { observer } from "mobx-react";
import * as React from "react";
import { FontFamilyTokenEditModal } from "./FontFamilyTokenEditModal";
import { GeneralTokenEditModal } from "./GeneralTokenEditModal";
import { ColorTokenPopup } from "./token-controls";

export const TokenEditModal = observer(function TokenEditModal(props: {
  studioCtx: StudioCtx;
  token: StyleToken;
  onClose: () => void;
  autoFocusName?: boolean;
  vsh?: VariantedStylesHelper;
}) {
  const { studioCtx, token, onClose, autoFocusName, vsh } = props;
  return (
    <>
      {token.type === TokenType.Color && (
        <ColorTokenPopup
          studioCtx={studioCtx}
          token={token}
          show={true}
          onClose={onClose}
          autoFocusName={autoFocusName}
          vsh={vsh}
        />
      )}

      {token.type === TokenType.FontFamily && (
        <FontFamilyTokenEditModal
          studioCtx={studioCtx}
          token={token}
          defaultEditingName={autoFocusName}
          onClose={onClose}
          vsh={vsh}
        />
      )}

      {token.type !== TokenType.Color &&
        token.type !== TokenType.FontFamily && (
          <GeneralTokenEditModal
            studioCtx={studioCtx}
            token={token}
            defaultEditingName={autoFocusName}
            onClose={onClose}
            vsh={vsh}
          />
        )}
    </>
  );
});
