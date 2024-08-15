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
        this.onModalClose = null;  // モーダルが正常に閉じられた場合に呼び出すコールバック

        this.setupEventListeners();
    }

    setupEventListeners() {
        // アクション選択
        this.actionSelectionCancelBtn.addEventListener('click', () => this.closeModal(this.actionSelectionModal));
        this.actionSelectionNextBtn.addEventListener('click', () => this.handleNext());
        document.querySelectorAll('input[name="selection-type"]').forEach(input => {
            input.addEventListener('change', () => {
                if (document.querySelector('input[name="selection-type"]:checked')) {
                    this.actionSelectionNextBtn.disabled = false; // 選択されたら「次へ」ボタンを有効化
                }
            });
        });
        // 部位番号登録
        this.partNumberCancelBtn.addEventListener('click', () => this.closeModal(this.partNumberModal));
        this.partNumberRegisterBtn.addEventListener('click', () => this.registerPartNumber());
        this.partNumberInput.addEventListener('input', () => {
            if (this.partNumberInput.value.trim() !== '') {
                this.partNumberRegisterBtn.disabled = false;
            }
        });
        // 遷移先画像登録
        this.transitionImageCancelBtn.addEventListener('click', () => this.closeModal(this.transitionImageModal));
        this.transitionImageRegisterBtn.addEventListener('click', () => this.registerTransitionScreen());
        this.transitionImageInput.addEventListener('input', () => {
            if (this.transitionImageInput.value.trim() !== '') {
                this.transitionImageRegisterBtn.disabled = false;
            }
        });
    }

    start(rect) {
        this.rect = rect;
        this.openModal(this.actionSelectionModal)
        console.log(this.registeredStatus)
        return new Promise((resolve, reject) => {
            // モーダルが正常に閉じられた場合にresolveを呼び出す
            this.onModalClose = () => {
                resolve(this.registeredStatus);
            };
        });
    }

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
        this.modals.forEach(modal => modal.classList.remove('inactive'));

        // すべてのモーダルが閉じているか確認
        // if (this.onModalClose) this.onModalClose();
    }

    //
    // アクション選択
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
    // 部位番号登録
    //
    registerPartNumber() {
        try {
            console.log('選択している矩形の相対座標:', this.rect);
            // TODO: API 叩く
            this.partNumberInput.value = '';
            this.closeModal(this.partNumberModal)
            // TODO: 矩形の枠の色を変える
            // すべてのモーダルが閉じているか確認
            if (this.onModalClose) this.onModalClose();
        } catch (e) {
            alert('部位番号の登録失敗')
        }
    }

    //
    // 遷移先画像登録
    //
    registerTransitionScreen() {
        try {
            console.log('選択している矩形の相対座標:', this.rect);
            // TODO: API 叩く
            this.transitionImageInput.value = ''
            this.closeModal(this.transitionImageModal)
            // TODO: 矩形の枠の色を変える
            // すべてのモーダルが閉じているか確認
            if (this.onModalClose) this.onModalClose();
        } catch (e) {
            alert('遷移画面の登録失敗')
        }
    }
}
