// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SessionListResponseDtoOutputItemsInner
    extends SessionListResponseDtoOutputItemsInner {
  @override
  final String sessionId;
  @override
  final bool current;
  @override
  final String deviceLabel;
  @override
  final String? ipAddress;
  @override
  final DateTime createdAt;
  @override
  final DateTime lastUsedAt;
  @override
  final DateTime expiresAt;

  factory _$SessionListResponseDtoOutputItemsInner(
          [void Function(SessionListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (SessionListResponseDtoOutputItemsInnerBuilder()..update(updates))
          ._build();

  _$SessionListResponseDtoOutputItemsInner._(
      {required this.sessionId,
      required this.current,
      required this.deviceLabel,
      this.ipAddress,
      required this.createdAt,
      required this.lastUsedAt,
      required this.expiresAt})
      : super._();
  @override
  SessionListResponseDtoOutputItemsInner rebuild(
          void Function(SessionListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SessionListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      SessionListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SessionListResponseDtoOutputItemsInner &&
        sessionId == other.sessionId &&
        current == other.current &&
        deviceLabel == other.deviceLabel &&
        ipAddress == other.ipAddress &&
        createdAt == other.createdAt &&
        lastUsedAt == other.lastUsedAt &&
        expiresAt == other.expiresAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sessionId.hashCode);
    _$hash = $jc(_$hash, current.hashCode);
    _$hash = $jc(_$hash, deviceLabel.hashCode);
    _$hash = $jc(_$hash, ipAddress.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, lastUsedAt.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'SessionListResponseDtoOutputItemsInner')
          ..add('sessionId', sessionId)
          ..add('current', current)
          ..add('deviceLabel', deviceLabel)
          ..add('ipAddress', ipAddress)
          ..add('createdAt', createdAt)
          ..add('lastUsedAt', lastUsedAt)
          ..add('expiresAt', expiresAt))
        .toString();
  }
}

class SessionListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<SessionListResponseDtoOutputItemsInner,
            SessionListResponseDtoOutputItemsInnerBuilder> {
  _$SessionListResponseDtoOutputItemsInner? _$v;

  String? _sessionId;
  String? get sessionId => _$this._sessionId;
  set sessionId(String? sessionId) => _$this._sessionId = sessionId;

  bool? _current;
  bool? get current => _$this._current;
  set current(bool? current) => _$this._current = current;

  String? _deviceLabel;
  String? get deviceLabel => _$this._deviceLabel;
  set deviceLabel(String? deviceLabel) => _$this._deviceLabel = deviceLabel;

  String? _ipAddress;
  String? get ipAddress => _$this._ipAddress;
  set ipAddress(String? ipAddress) => _$this._ipAddress = ipAddress;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _lastUsedAt;
  DateTime? get lastUsedAt => _$this._lastUsedAt;
  set lastUsedAt(DateTime? lastUsedAt) => _$this._lastUsedAt = lastUsedAt;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  SessionListResponseDtoOutputItemsInnerBuilder() {
    SessionListResponseDtoOutputItemsInner._defaults(this);
  }

  SessionListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sessionId = $v.sessionId;
      _current = $v.current;
      _deviceLabel = $v.deviceLabel;
      _ipAddress = $v.ipAddress;
      _createdAt = $v.createdAt;
      _lastUsedAt = $v.lastUsedAt;
      _expiresAt = $v.expiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SessionListResponseDtoOutputItemsInner other) {
    _$v = other as _$SessionListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(SessionListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SessionListResponseDtoOutputItemsInner build() => _build();

  _$SessionListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$SessionListResponseDtoOutputItemsInner._(
          sessionId: BuiltValueNullFieldError.checkNotNull(sessionId,
              r'SessionListResponseDtoOutputItemsInner', 'sessionId'),
          current: BuiltValueNullFieldError.checkNotNull(
              current, r'SessionListResponseDtoOutputItemsInner', 'current'),
          deviceLabel: BuiltValueNullFieldError.checkNotNull(deviceLabel,
              r'SessionListResponseDtoOutputItemsInner', 'deviceLabel'),
          ipAddress: ipAddress,
          createdAt: BuiltValueNullFieldError.checkNotNull(createdAt,
              r'SessionListResponseDtoOutputItemsInner', 'createdAt'),
          lastUsedAt: BuiltValueNullFieldError.checkNotNull(lastUsedAt,
              r'SessionListResponseDtoOutputItemsInner', 'lastUsedAt'),
          expiresAt: BuiltValueNullFieldError.checkNotNull(expiresAt,
              r'SessionListResponseDtoOutputItemsInner', 'expiresAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
