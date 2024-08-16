// アクション選択 -> 部位番号登録
// アクション選択 -> 遷移先画像登録
export class ImagePartRegistrationProcess {
    constructor() {
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
        this.transitionImageModal = document.getElementById('transition-screen-modal');
        this.transitionImageCancelBtn = this.transitionImageModal.querySelector('.cancel-btn');
        this.transitionImageRegisterBtn = this.transitionImageModal.querySelector('.register-btn');
        this.transitionImageInput = this.transitionImageModal.querySelector('#transition-screen-input');

        this.modals = document.querySelectorAll('.modal');
        this.rect = null; // 選択されている矩形の相対座標
        this.registeredStatus = {
            partNumberRegistered: false,
            transitionImageRegistered: false
        }

        this.onRegistrationSuccess = null // 登録成功時に呼び出すコールバック
        this.onRegistrationFailure = null // 登録失敗時に呼び出すコールバック

        this.setupEventListeners();
    }

    //
    // EventListener
    //
    setupEventListeners() {
        // アクション選択
        this.actionSelectionCancelBtn.addEventListener('click', () => this.cancelRegistration());
        this.actionSelectionNextBtn.addEventListener('click', () => this.handleNext());
        this.setupSelectionTypeListeners()
        // 部位番号登録
        this.partNumberCancelBtn.addEventListener('click', () => this.closeModal(this.partNumberModal));
        this.partNumberRegisterBtn.addEventListener('click', () => this.registerPartNumber());
        this.partNumberInput.addEventListener('input', () => {
            this.enableRegisterBtnBasedOnInput(this.partNumberInput, this.partNumberRegisterBtn)
        });
        // 遷移先画像登録
        this.transitionImageCancelBtn.addEventListener('click', () => this.closeModal(this.transitionImageModal));
        this.transitionImageRegisterBtn.addEventListener('click', () => this.registerTransitionImage());
        this.transitionImageInput.addEventListener('input', () => {
            this.enableRegisterBtnBasedOnInput(this.transitionImageInput, this.transitionImageRegisterBtn)
        });
    }

    // ラジオボタンの選択状態に応じて「次へ」ボタンを有効化する
    setupSelectionTypeListeners() {
        const selectionInputs = this.actionSelectionModal.querySelectorAll('input[name="selection-type"]');
        selectionInputs.forEach(input => {
            input.addEventListener('change', () => this.enableNextButtonOnSelection())
        })
    }

    enableNextButtonOnSelection() {
        if (document.querySelector('input[name="selection-type"]:checked')) {
            this.actionSelectionNextBtn.disabled = false;
        } else {
            this.actionSelectionNextBtn.disabled = true;
        }
    }

    // 入力の有無に応じてボタンの有効/無効を切り替える
    enableRegisterBtnBasedOnInput(inputElement, buttonElement) {
        if (inputElement.value.trim() !== '') {
            buttonElement.disabled = false;
        } else {
            buttonElement.disabled = true;
        }
    }

    start(rect) {
        // TODO: 必要なrectの情報だけ
        this.rect = rect;
        this.registeredStatus = {
            partNumberRegistered: rect.partNumberRegistered,
            transitionImageRegistered: rect.transitionImageRegistered,
        }
        this.openModal(this.actionSelectionModal)

        // モーダルが正常に閉じられた場合に this.registeredStatus を返す
        // APIでエラーになった場合は、reject ではなく、エラーを投げる
        return new Promise((resolve, reject) => {
            this.onRegistrationSuccess = () => resolve(this.registeredStatus);
            this.onRegistrationFailure = (error) => reject(error);
        });
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
    // 登録成功・失敗後の処理
    //
    afterRegistrationSuccess() {
        this.closeAllModals()
        if (this.onRegistrationSuccess) this.onRegistrationSuccess()
    }

    afterRegistrationFailure(err) {
        this.closeAllModals()
        if (this.onRegistrationFailure) this.onRegistrationFailure(err)
    }

    // 登録処理のキャンセル = 成功処理と同じ流れ
    cancelRegistration() {
        this.afterRegistrationSuccess()
    }

    //
    // アクション選択モーダル
    //
    handleNext() {
        const selectionType= document.querySelector('input[name="selection-type"]:checked').value;
        if (selectionType === 'part-number') {
            // 部位番号登録モーダルを開く
            this.openPartNumberModal();
        } else if (selectionType === 'transition-screen') {
            // 遷移画面登録モーダルを開く
            this.openTransitionScreenModal();
        }
    }

    openPartNumberModal() {
        this.openModal(this.partNumberModal)
    }

    openTransitionScreenModal() {
        this.openModal(this.transitionImageModal)
    }

    //
    // 部位番号登録モーダル
    //
    registerPartNumber() {
        try {
            // TODO: this.rect を利用して、部位番号登録 API 叩く
            console.log('選択している矩形の相対座標:', this.rect)
            // TODO: Reset Input
            this.partNumberInput.value = ''
            this.registeredStatus.partNumberRegistered = true
            this.afterRegistrationSuccess()
        } catch (err) {
            console.error('部位番号の登録失敗')
            this.afterRegistrationFailure(err)
        }
    }

    //
    // 遷移先画像登録モーダル
    //
    registerTransitionImage() {
        try {
            // TODO: this.rect を利用(?)して、遷移先画像登録 API 叩く
            console.log('選択している矩形の相対座標:', this.rect)
            // TODO: Reset Input
            this.transitionImageInput.value = ''
            this.registeredStatus.transitionImageRegistered = true
            this.afterRegistrationSuccess()
        } catch (err) {
            console.error('遷移先画像の登録失敗', err)
            this.afterRegistrationFailure(err)
        }
    }
}
