// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'route_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RouteListResponseDtoOutputItemsInnerStatusEnum
    _$routeListResponseDtoOutputItemsInnerStatusEnum_ACTIVE =
    const RouteListResponseDtoOutputItemsInnerStatusEnum._('ACTIVE');
const RouteListResponseDtoOutputItemsInnerStatusEnum
    _$routeListResponseDtoOutputItemsInnerStatusEnum_INACTIVE =
    const RouteListResponseDtoOutputItemsInnerStatusEnum._('INACTIVE');

RouteListResponseDtoOutputItemsInnerStatusEnum
    _$routeListResponseDtoOutputItemsInnerStatusEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$routeListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$routeListResponseDtoOutputItemsInnerStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RouteListResponseDtoOutputItemsInnerStatusEnum>
    _$routeListResponseDtoOutputItemsInnerStatusEnumValues = BuiltSet<
        RouteListResponseDtoOutputItemsInnerStatusEnum>(const <RouteListResponseDtoOutputItemsInnerStatusEnum>[
  _$routeListResponseDtoOutputItemsInnerStatusEnum_ACTIVE,
  _$routeListResponseDtoOutputItemsInnerStatusEnum_INACTIVE,
]);

const RouteListResponseDtoOutputItemsInnerMetricsSourceEnum
    _$routeListResponseDtoOutputItemsInnerMetricsSourceEnum_GOONG =
    const RouteListResponseDtoOutputItemsInnerMetricsSourceEnum._('GOONG');
const RouteListResponseDtoOutputItemsInnerMetricsSourceEnum
    _$routeListResponseDtoOutputItemsInnerMetricsSourceEnum_ESTIMATE =
    const RouteListResponseDtoOutputItemsInnerMetricsSourceEnum._('ESTIMATE');

RouteListResponseDtoOutputItemsInnerMetricsSourceEnum
    _$routeListResponseDtoOutputItemsInnerMetricsSourceEnumValueOf(
        String name) {
  switch (name) {
    case 'GOONG':
      return _$routeListResponseDtoOutputItemsInnerMetricsSourceEnum_GOONG;
    case 'ESTIMATE':
      return _$routeListResponseDtoOutputItemsInnerMetricsSourceEnum_ESTIMATE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RouteListResponseDtoOutputItemsInnerMetricsSourceEnum>
    _$routeListResponseDtoOutputItemsInnerMetricsSourceEnumValues = BuiltSet<
        RouteListResponseDtoOutputItemsInnerMetricsSourceEnum>(const <RouteListResponseDtoOutputItemsInnerMetricsSourceEnum>[
  _$routeListResponseDtoOutputItemsInnerMetricsSourceEnum_GOONG,
  _$routeListResponseDtoOutputItemsInnerMetricsSourceEnum_ESTIMATE,
]);

Serializer<RouteListResponseDtoOutputItemsInnerStatusEnum>
    _$routeListResponseDtoOutputItemsInnerStatusEnumSerializer =
    _$RouteListResponseDtoOutputItemsInnerStatusEnumSerializer();
Serializer<RouteListResponseDtoOutputItemsInnerMetricsSourceEnum>
    _$routeListResponseDtoOutputItemsInnerMetricsSourceEnumSerializer =
    _$RouteListResponseDtoOutputItemsInnerMetricsSourceEnumSerializer();

class _$RouteListResponseDtoOutputItemsInnerStatusEnumSerializer
    implements
        PrimitiveSerializer<RouteListResponseDtoOutputItemsInnerStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RouteListResponseDtoOutputItemsInnerStatusEnum
  ];
  @override
  final String wireName = 'RouteListResponseDtoOutputItemsInnerStatusEnum';

  @override
  Object serialize(Serializers serializers,
          RouteListResponseDtoOutputItemsInnerStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RouteListResponseDtoOutputItemsInnerStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RouteListResponseDtoOutputItemsInnerStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RouteListResponseDtoOutputItemsInnerMetricsSourceEnumSerializer
    implements
        PrimitiveSerializer<
            RouteListResponseDtoOutputItemsInnerMetricsSourceEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'GOONG': 'GOONG',
    'ESTIMATE': 'ESTIMATE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'GOONG': 'GOONG',
    'ESTIMATE': 'ESTIMATE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RouteListResponseDtoOutputItemsInnerMetricsSourceEnum
  ];
  @override
  final String wireName =
      'RouteListResponseDtoOutputItemsInnerMetricsSourceEnum';

  @override
  Object serialize(Serializers serializers,
          RouteListResponseDtoOutputItemsInnerMetricsSourceEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RouteListResponseDtoOutputItemsInnerMetricsSourceEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RouteListResponseDtoOutputItemsInnerMetricsSourceEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RouteListResponseDtoOutputItemsInner
    extends RouteListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String name;
  @override
  final RouteListResponseDtoOutputItemsInnerStatusEnum status;
  @override
  final int totalDistanceMeters;
  @override
  final int totalDurationSeconds;
  @override
  final RouteListResponseDtoOutputItemsInnerMetricsSourceEnum metricsSource;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final int stopCount;

  factory _$RouteListResponseDtoOutputItemsInner(
          [void Function(RouteListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (RouteListResponseDtoOutputItemsInnerBuilder()..update(updates))._build();

  _$RouteListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.name,
      required this.status,
      required this.totalDistanceMeters,
      required this.totalDurationSeconds,
      required this.metricsSource,
      required this.createdAt,
      required this.updatedAt,
      required this.stopCount})
      : super._();
  @override
  RouteListResponseDtoOutputItemsInner rebuild(
          void Function(RouteListResponseDtoOutputItemsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RouteListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      RouteListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RouteListResponseDtoOutputItemsInner &&
        id == other.id &&
        name == other.name &&
        status == other.status &&
        totalDistanceMeters == other.totalDistanceMeters &&
        totalDurationSeconds == other.totalDurationSeconds &&
        metricsSource == other.metricsSource &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        stopCount == other.stopCount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, totalDistanceMeters.hashCode);
    _$hash = $jc(_$hash, totalDurationSeconds.hashCode);
    _$hash = $jc(_$hash, metricsSource.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, stopCount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RouteListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('name', name)
          ..add('status', status)
          ..add('totalDistanceMeters', totalDistanceMeters)
          ..add('totalDurationSeconds', totalDurationSeconds)
          ..add('metricsSource', metricsSource)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('stopCount', stopCount))
        .toString();
  }
}

class RouteListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<RouteListResponseDtoOutputItemsInner,
            RouteListResponseDtoOutputItemsInnerBuilder> {
  _$RouteListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  RouteListResponseDtoOutputItemsInnerStatusEnum? _status;
  RouteListResponseDtoOutputItemsInnerStatusEnum? get status => _$this._status;
  set status(RouteListResponseDtoOutputItemsInnerStatusEnum? status) =>
      _$this._status = status;

  int? _totalDistanceMeters;
  int? get totalDistanceMeters => _$this._totalDistanceMeters;
  set totalDistanceMeters(int? totalDistanceMeters) =>
      _$this._totalDistanceMeters = totalDistanceMeters;

  int? _totalDurationSeconds;
  int? get totalDurationSeconds => _$this._totalDurationSeconds;
  set totalDurationSeconds(int? totalDurationSeconds) =>
      _$this._totalDurationSeconds = totalDurationSeconds;

  RouteListResponseDtoOutputItemsInnerMetricsSourceEnum? _metricsSource;
  RouteListResponseDtoOutputItemsInnerMetricsSourceEnum? get metricsSource =>
      _$this._metricsSource;
  set metricsSource(
          RouteListResponseDtoOutputItemsInnerMetricsSourceEnum?
              metricsSource) =>
      _$this._metricsSource = metricsSource;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  int? _stopCount;
  int? get stopCount => _$this._stopCount;
  set stopCount(int? stopCount) => _$this._stopCount = stopCount;

  RouteListResponseDtoOutputItemsInnerBuilder() {
    RouteListResponseDtoOutputItemsInner._defaults(this);
  }

  RouteListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _status = $v.status;
      _totalDistanceMeters = $v.totalDistanceMeters;
      _totalDurationSeconds = $v.totalDurationSeconds;
      _metricsSource = $v.metricsSource;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _stopCount = $v.stopCount;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RouteListResponseDtoOutputItemsInner other) {
    _$v = other as _$RouteListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(RouteListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RouteListResponseDtoOutputItemsInner build() => _build();

  _$RouteListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$RouteListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'RouteListResponseDtoOutputItemsInner', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'RouteListResponseDtoOutputItemsInner', 'name'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'RouteListResponseDtoOutputItemsInner', 'status'),
          totalDistanceMeters: BuiltValueNullFieldError.checkNotNull(
              totalDistanceMeters,
              r'RouteListResponseDtoOutputItemsInner',
              'totalDistanceMeters'),
          totalDurationSeconds: BuiltValueNullFieldError.checkNotNull(
              totalDurationSeconds,
              r'RouteListResponseDtoOutputItemsInner',
              'totalDurationSeconds'),
          metricsSource: BuiltValueNullFieldError.checkNotNull(metricsSource,
              r'RouteListResponseDtoOutputItemsInner', 'metricsSource'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'RouteListResponseDtoOutputItemsInner', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(
              updatedAt, r'RouteListResponseDtoOutputItemsInner', 'updatedAt'),
          stopCount: BuiltValueNullFieldError.checkNotNull(
              stopCount, r'RouteListResponseDtoOutputItemsInner', 'stopCount'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
