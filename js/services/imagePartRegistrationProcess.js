// アクション選択 -> 部位番号登録
// アクション選択 -> 遷移先画像登録
export class ImagePartRegistrationProcess {
    constructor() {
        this.modals = document.querySelectorAll('.modal')
        // アクション選択
        this.actionSelectionModal = document.getElementById('action-selection-modal');
        this.actionSelectionCancelBtn = this.actionSelectionModal.querySelector('.cancel-btn');
        this.actionSelectionNextBtn = this.actionSelectionModal.querySelector('.next-btn');
        // 部位番号登録
        this.partNumberModal = document.getElementById('part-number-modal');
        this.partNumberCancelBtn = this.partNumberModal.querySelector('.cancel-btn');
        this.partNumberRegisterBtn = this.partNumberModal.querySelector('.register-btn');
        this.partNumberInput = this.partNumberModal.querySelector('#part-number-input');
        // 遷移先画像登録
        this.transitionImageModal = document.getElementById('transition-image-modal');
        this.transitionImageCancelBtn = this.transitionImageModal.querySelector('.cancel-btn');
        this.transitionImageRegisterBtn = this.transitionImageModal.querySelector('.register-btn');
        this.transitionImageInput = this.transitionImageModal.querySelector('#transition-image-input');

        this.rect = null; // 選択している矩形の相対座標と登録ステータスを管理するステート

        this.onRegistrationSuccess = null // 登録成功時に呼び出すコールバック
        this.onRegistrationFailure = null // 登録失敗時に呼び出すコールバック

        this.setupEventListeners();
    }

    //
    // EventListener
    //
    setupEventListeners() {
        // アクション選択
        this.actionSelectionCancelBtn.addEventListener('click', () => this.handleRegistrationCancel());
        this.actionSelectionNextBtn.addEventListener('click', () => this.handleNext());
        this.setupSelectionTypeListeners()
        // 部位番号登録
        this.partNumberCancelBtn.addEventListener('click', () => this.handleModalClose(this.partNumberModal));
        this.partNumberRegisterBtn.addEventListener('click', () => this.handlePartNumberRegister());
        this.partNumberInput.addEventListener('input', () => {
            this.handleRegisterBtnEnable(this.partNumberInput, this.partNumberRegisterBtn)
        });
        // 遷移先画像登録
        this.transitionImageCancelBtn.addEventListener('click', () => this.handleModalClose(this.transitionImageModal));
        this.transitionImageRegisterBtn.addEventListener('click', () => this.handleTransitionImageRegister());
        this.transitionImageInput.addEventListener('input', () => {
            this.handleRegisterBtnEnable(this.transitionImageInput, this.transitionImageRegisterBtn)
        });
    }

    // ラジオボタンの選択状態に応じて「次へ」ボタンを有効化する
    setupSelectionTypeListeners() {
        const selectionInputs = this.actionSelectionModal.querySelectorAll('input[name="selection-type"]');
        selectionInputs.forEach(input => {
            input.addEventListener('change', () => this.handleNextBtnEnable())
        })
    }

    handleNextBtnEnable() {
        if (document.querySelector('input[name="selection-type"]:checked')) {
            this.actionSelectionNextBtn.disabled = false;
        } else {
            this.actionSelectionNextBtn.disabled = true;
        }
    }

    // 入力の有無に応じてボタンの有効/無効を切り替える
    handleRegisterBtnEnable(inputElement, buttonElement) {
        if (inputElement.value.trim() !== '') {
            buttonElement.disabled = false;
        } else {
            buttonElement.disabled = true;
        }
    }

    handleModalClose(targetModal) {
        this.closeModal(targetModal)
    }

    start(targetRect) {
        this.rect = targetRect
        this.openModal(this.actionSelectionModal)

        // 登録成功時、this.rect を返す
        // 登録失敗時、error を投げる
        // 登録キャンセル時、this.rect を返す
        return new Promise((resolve, reject) => {
            this.onRegistrationSuccess = () => resolve(this.rect);
            this.onRegistrationFailure = (error) => reject(error);
        });
    }

    // 登録ステータスを更新する関数
    updateRegisteredStatus(type) {
        if (type === 'partNumber') {
            this.rect.partNumberRegistered = true
        } else if (type === 'transitionImage') {
            this.rect.transitionImageRegistered = true
        }
    }

    // 登録ステータスを更新する関数
    updateDeletedStatus() {
        this.rect.deleted = true
    }

    //
    // モーダル開閉
    //
    openModal(targetModal) {
        this.modals.forEach(modal => {
            if (modal === targetModal) {
                modal.style.display = 'block';
                modal.classList.remove('inactive');
            } else {
                modal.classList.add('inactive');
            }
        });
    }

    closeModal(targetModal) {
        targetModal.style.display = 'none';
        // TODO：ロジック要見直し
        this.modals.forEach(modal => modal.classList.remove('inactive'));
    }

    closeAllModals() {
        this.closeModal(this.partNumberModal);
        this.closeModal(this.transitionImageModal);
        this.closeModal(this.actionSelectionModal);
    }

    //
    // 登録後、途中キャンセルの処理
    //
    // 登録成功後の処理
    afterRegistrationSuccess() {
        this.resetInputFields()
        this.resetActionSelectionModal()
        this.closeAllModals()
        if (this.onRegistrationSuccess) this.onRegistrationSuccess()
    }

    // 登録失敗後の処理
    afterRegistrationFailure(err) {
        if (this.onRegistrationFailure) this.onRegistrationFailure(err)
    }

    // 登録キャンセル時の処理
    handleRegistrationCancel() {
        this.resetActionSelectionModal()
        this.closeAllModals()
        if (this.onRegistrationSuccess) this.onRegistrationSuccess()
    }

    //
    // 入力値のクリア
    //
    resetInputFields() {
        // テキスト入力フィールドをクリア
        this.partNumberInput.value = ''
        this.transitionImageInput.value = ''
    }

    resetActionSelectionModal() {
        // ラジオボタンの選択を解除
        this.actionSelectionModal.querySelectorAll('input[name="selection-type"]').forEach(radio => {
            radio.checked = false;
        });

        // 次へボタンを無効化
        this.actionSelectionNextBtn.disabled = true;
    }

    //
    // アクション選択モーダル
    //
    handleNext() {
        const selectionType= this.actionSelectionModal.querySelector('input[name="selection-type"]:checked').value;
        if (selectionType === 'part-number') {
            this.openPartNumberModal();
        } else if (selectionType === 'transition-image') {
            this.openTransitionImageModal();
        } else if (selectionType === 'delete-rect') {
            this.deleteRect();
        }
    }

    openPartNumberModal() {
        this.openModal(this.partNumberModal)
    }

    openTransitionImageModal() {
        this.openModal(this.transitionImageModal)
    }

    //
    // 部位番号登録モーダル
    //
    handlePartNumberRegister() {
        try {
            // TODO: this.rect を利用して、部位番号登録 API 叩く
            console.log('選択している矩形の相対座標:', this.rect)
            this.updateRegisteredStatus('partNumber')
            this.afterRegistrationSuccess()
        } catch (err) {
            console.error('部位番号の登録失敗')
            this.afterRegistrationFailure(err)
        }
    }

    //
    // 遷移先画像登録モーダル
    //
    handleTransitionImageRegister() {
        try {
            // TODO: this.rect を利用(?)して、遷移先画像登録 API 叩く
            console.log('選択している矩形の相対座標:', this.rect)
            this.updateRegisteredStatus('transitionImage')
            this.afterRegistrationSuccess()
        } catch (err) {
            console.error('遷移先画像の登録失敗', err)
            this.afterRegistrationFailure(err)
        }
    }

    deleteRect() {
        try {
            // TODO: this.rect を利用して、矩形削除 APIを叩く
            this.updateDeletedStatus()
            this.afterRegistrationSuccess()
        } catch (err) {
            console.error('矩形削除失敗', err)
            this.afterRegistrationFailure(err)
        }
    }
}
